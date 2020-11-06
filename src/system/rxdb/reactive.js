import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import mergeWith from 'lodash/mergeWith'
import * as lodashSet from 'lodash/set'
import * as lodashHas from 'lodash/has'
import { wait } from 'src/system/utils'
import { MutexLocal } from 'src/system/rxdb/mutex'
import { WsItemTypeEnum } from 'src/system/rxdb/workspace'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_REACTIVE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_REACTIVE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_REACTIVE)

function getReactive (rxDoc) {
   let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
   return reactiveItemHolder.getReactiveItem()
}

function mergeReactiveItem (reactiveItem, change) {
   if (reactiveItem && typeof reactiveItem === 'object') {
      assert(typeof change === 'object', 'typeof change !== object')
      return mergeWith(reactiveItem, change, (objValue, srcValue, key, object, source, stack) => {
         if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            objValue.splice(0, objValue.length, ...srcValue)
            return objValue
         } else if (typeof objValue === 'object' && typeof srcValue === 'object') {
            for (let key in objValue) {
               if (!(key in srcValue)) delete objValue[key] // удаляем удалившиеся
            }
            return undefined // default behavior
         } else {
            return undefined // default behavior
         }
      })
   } else return change
}

// все изменения rxDoc - только через эту ф-ю!!! Иначе - возможны гонки (из-за debounce)
// либо - менять непосредственно reactiveItem(reactiveItem.prop = ...) (либо через reactiveItem.updateExtended)
// synchro - синхронить эти изменения на сервер
async function updateRxDoc (rxDocOrId, path, valueOrFunc, debouncedSave = true, synchro = true) {
   const f = updateRxDoc
   logD(f, 'start')
   const t1 = performance.now()
   // logD(f, 'start2', rxDocOrId, path, valueOrFunc)
   assert(rxDocOrId && path, '!(rxDocOrId && path)')
   if (!rxDocOrId) return
   let rxDoc
   if (isRxDocument(rxDocOrId)) {
      rxDoc = rxDocOrId
   } else {
      // rxDoc = await rxdb.getRxDoc(rxDocOrId) так нельзя (будет запрашивать отсутствующие)
      rxDoc = await rxdb.cache.get(rxDocOrId) // берем только те что есть в кэше ( с сервера не запрашиваем)
   }
   if (rxDoc) {
      let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
      let reactiveItem = reactiveItemHolder.getReactiveItem()
      assert(reactiveItem || reactiveItem === '', '!reactiveItem')
      try {
         reactiveItemHolder.setDebouncedSave(debouncedSave)
         reactiveItemHolder.setSynchro(synchro)
         let value
         if (typeof valueOrFunc === 'function') {
            value = valueOrFunc(JSON.parse(JSON.stringify(reactiveItem)))
            assert(value)
         } else value = valueOrFunc
         if (reactiveItem && typeof reactiveItem === 'object') {
            if (!lodashHas(reactiveItem, path)) { // если проперти не было, то реактивности тоже нет (работаем через Vue.set)
               let rootPath = path.split('.')[0]
               let tmpObj = {}
               lodashSet(tmpObj, path, value)
               Vue.set(reactiveItem, rootPath, tmpObj[rootPath]) // меняем целиком объект
            } else {
               lodashSet(reactiveItem, path, value)
            }
         } else {
            assert(!path, '!!path')
            reactiveItemHolder.setReactiveItem(value)
         }
         // logD(f, 'complete', reactiveItemHolder.reactiveItem)
      } finally {
         wait(0).then(() => { // нужно чтобы setDebouncedSave сработала после эвентов itemSubscribe
            reactiveItemHolder.setDebouncedSave(true)
            reactiveItemHolder.setSynchro(true)
         })
      }
   }
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

const debounceIntervalItem = 2000 // дебаунс сохранения реактивных элементов в rxdb

// класс-обертка над rxDoc для реактивности
class ReactiveItemHolder {
   constructor (rxDoc) {
      assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
      assert(rxDoc.id, '!rxDoc.id')
      logD('ReactiveItemHolder::constructor', rxDoc.id)
      if (rxDoc.wsItemType) this.itemType = 'wsItem'
      else if (rxDoc.cached) this.itemType = 'object'
      else if (rxDoc.valueString) this.itemType = 'meta'
      else throw new Error('bad itemType')
      this.getDataForReactiveItem = (plainData) => {
         switch (this.itemType) {
            case 'wsItem':
               return plainData // wsSchemaItem
            case 'object':
               return plainData.cached.data // cacheSchema
            case 'meta':
               return plainData // plainData.valueString // schemaKeyValue
            default:
               throw new Error('bad itemType: ' + this.itemType)
         }
      }

      if (rxDoc.reactiveItemHolderMaster) {
         this.getReactiveItem = rxDoc.reactiveItemHolderMaster.getReactiveItem
         this.setReactiveItem = rxDoc.reactiveItemHolderMaster.setReactiveItem
         this.itemSubscribe = rxDoc.reactiveItemHolderMaster.itemSubscribe
         this.itemUnsubscribe = rxDoc.reactiveItemHolderMaster.itemUnsubscribe
         this.rxDocSubscribe = rxDoc.reactiveItemHolderMaster.rxDocSubscribe
         this.rxDocUnsubscribe = rxDoc.reactiveItemHolderMaster.rxDocUnsubscribe
         this.getDebouncedSave = rxDoc.reactiveItemHolderMaster.getDebouncedSave
         this.setDebouncedSave = rxDoc.reactiveItemHolderMaster.setDebouncedSave
         this.getSynchro = rxDoc.reactiveItemHolderMaster.getSynchro
         this.setSynchro = rxDoc.reactiveItemHolderMaster.setSynchro
         this.getRev = rxDoc.reactiveItemHolderMaster.getRev
         this.setRev = rxDoc.reactiveItemHolderMaster.setRev
      } else {
         this.rxDoc = rxDoc
         this.mutex = new MutexLocal('ReactiveItemHolder::constructor')
         this.vm = new Vue({
            data: {
               reactiveData: {},
               rev: rxDoc._rev
            }
         })
         this.debouncedSave = true
         this.synchro = true
         this.getReactiveItem = () => {
            return this.vm.reactiveData.reactiveItem
         }
         this.setReactiveItem = (reactiveItem) => {
            assert(typeof reactiveItem === 'object', '!typeof reactiveItem === object') // сейчас reactiveItem - всегда объект (даже для META)
            if (reactiveItem && typeof reactiveItem === 'object') {
               reactiveItem.updateExtended = async (path, value, debouncedSave = true, synchro = true) => {
                  await updateRxDoc(this.rxDoc, path, value, debouncedSave, synchro)
               }
               if (reactiveItem.wsItemType) {
                  reactiveItem.remove = async (permanent = false) => {
                     if (reactiveItem.beforeRemove) await reactiveItem.beforeRemove(permanent)
                     if (permanent) await this.rxDoc.remove()
                     else await updateRxDoc(this.rxDoc, 'deletedAt', Date.now(), false)
                  }
                  reactiveItem.restoreFromTrash = async () => {
                     await updateRxDoc(this.rxDoc, 'deletedAt', 0, false)
                  }
                  rxdb.workspace.populateReactiveWsItem(reactiveItem)
               }
            }
            Vue.set(this.vm.reactiveData, 'reactiveItem', reactiveItem)
         }
         this.getDebouncedSave = () => {
            return this.debouncedSave
         }
         this.setDebouncedSave = (flag) => {
            this.debouncedSave = flag
         }
         this.getSynchro = () => {
            return this.synchro
         }
         this.setSynchro = (flag) => {
            this.synchro = flag
         }
         this.getRev = () => {
            return this.vm.rev
         }
         this.setRev = (rev) => {
            assert(rev, '!_rev')
            this.vm.rev = rev
         }
         this.setReactiveItem(this.getDataForReactiveItem(rxDoc.toJSON()))
         this.rxDocSubscribe()
         this.itemSubscribe()
         rxDoc.reactiveItemHolderMaster = this
      }
   }

   rxDocSubscribe () {
      const f = this.rxDocSubscribe
      // logD(f, `rxDoc subscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
      if (this.rxDocSubscription) return
      // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
      this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
         try {
            await this.mutex.lock('rxDocSubscribe') // обязательно сначала блокируем !!! (см itemSubscribe)
            assert(this.getRev() && change._rev, '!this.getRev() && change._rev')
            if (this.getRev() === change._rev) return // изменения уже применены к reactiveItem (см this.itemSubscribe())
            this.itemUnsubscribe()
            // logD(f, `rxDoc changed. try to change reactiveItem (${this.id}). ${change.id}`)
            this.setReactiveItem(mergeReactiveItem(this.getReactiveItem(), this.getDataForReactiveItem(change)))
            this.setRev(change._rev)
            // logD(f, `reactiveItem changed`)
         } finally {
            this.itemSubscribe()
            this.mutex.release()
         }
      })
   }

   rxDocUnsubscribe () {
      const f = this.rxDocUnsubscribe
      // logD(f, `rxDoc unsubscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
      if (this.rxDocSubscription) this.rxDocSubscription.unsubscribe()
      delete this.rxDocSubscription
   }

   itemSubscribe () {
      const f = this.itemSubscribe
      if (this.itemUnsubscribeFunc) return
      this.itemUnsubscribeFunc = this.vm.$watch('reactiveData', async (newVal, oldVal) => {
         // reactiveItem изменилась (обычно из UI)
         if (!this.debouncedItemSaveFunc) {
            // itemSaveFunc - сохраняет текущий reactiveItem в rxdb
            this.itemSaveFunc = async (synchro = true) => {
               // игнорируем newVal (берем из this.reactiveItem)!!! this.reactiveItem содержит самые актуальные данные!
               const f = this.itemSaveFunc
               if (this.rxDoc.deleted) return // из-за дебаунса такое возможно
               try {
                  await this.mutex.lock('itemSubscribe') // обязательно сначала блокируем !!! (см rxDocSubscribe)
                  // this.rxDocUnsubscribe() !!!! --- не отписываемся от изменения тк может быть более одного документа rxDoc ( и на каждый - свой reactiveItem!) работает this._rev
                  // logD(f, `try to change rxDoc ${this.rxDoc.id} ${this._rev} ${this.rxDoc._rev}`)
                  let updatedRxDoc = await this.rxDoc.atomicUpdate((oldData) => {
                     let newData = oldData
                     let item = JSON.parse(JSON.stringify(this.getReactiveItem())) // убираем реактивную хрень
                     switch (this.itemType) {
                        case 'wsItem':
                           newData = item // wsSchemaItem
                           newData._rev = oldData._rev // ревизия от rxdb (иначе - ошибки)
                           if (synchro) newData.hasChanges = true // итем изменился локально. надо отправить изменеия на сервер
                           break
                        case 'object':
                           newData.cached.data = item // cacheSchema
                           break
                        case 'meta':
                           newData = item // newData.valueString = item // schemaKeyValue
                           newData._rev = oldData._rev // ревизия от rxdb (иначе - ошибки)
                           break
                        default:
                           throw new Error('bad itemType: ' + this.itemType)
                     }
                     return newData
                  })
                  this.setRev(updatedRxDoc._rev)
                  // logD(f, `rxDoc changed ${updatedRxDoc.id} ${updatedRxDoc._rev}`)
               } finally {
                  // this.rxDocSubscribe()
                  this.mutex.release()
               }
            }
            this.debouncedItemSaveFunc = debounce(this.itemSaveFunc, debounceIntervalItem)
         }
         if (this.getDebouncedSave()) {
            // logD(f, `reactiveItem changed (rxDoc will change via debounce later)`)
            this.debouncedItemSaveFunc(this.getSynchro())
         } else {
            // logD(f, `reactiveItem changed without debounce`)
            await this.itemSaveFunc(this.getSynchro())
         }
      }, { deep: true, immediate: false })
   }

   itemUnsubscribe () {
      const f = this.itemUnsubscribe
      if (this.itemUnsubscribeFunc) this.itemUnsubscribeFunc()
      delete this.itemUnsubscribeFunc
   }
}

// class ReactiveListHolder {
//    async create (rxQuery) {
//       logD('ReactiveListHolder::constructor: ', rxQuery.mangoQuery.selector)
//       assert(isRxQuery(rxQuery), '!isRxQuery(rxQuery)')
//       try {
//          if (rxQuery.reactiveListHolderMaster) {
//             await rxQuery.reactiveListHolderMaster.mutex.lock('ReactiveListHolder::create')
//             this.reactiveList = rxQuery.reactiveListHolderMaster.reactiveList
//             assert(this.reactiveList, '!this.reactiveList!')
//          } else {
//             this.mutex = new MutexLocal('ReactiveListHolder::constructor')
//             await this.mutex.lock('ReactiveListHolder::create')
//             rxQuery.reactiveListHolderMaster = this
//             this.rxQuery = rxQuery
//             let docs = await rxQuery.exec()
//             assert(Array.isArray(docs), 'Array.isArray(docs)')
//             this.vm = new Vue({
//                data: {
//                   reactiveList: docs.map(rxDoc => getReactive(rxDoc))
//                }
//             })
//             this.reactiveList = this.vm.reactiveList
//             assert(Array.isArray(this.vm.reactiveList), 'Array.isArray(this.vm.reactiveList)')
//             this.rxQuerySubscribe()
//             this.listSubscribe()
//          }
//       } finally {
//          if (rxQuery.reactiveListHolderMaster) {
//             rxQuery.reactiveListHolderMaster.mutex.release()
//          } else {
//             this.mutex.release()
//          }
//       }
//       assert(this.reactiveList, '!this.reactiveList!2')
//       return this.reactiveList
//    }
//
//    rxQuerySubscribe () {
//       const f = this.rxQuerySubscribe
//       if (this.rxQuerySubscription) return
//       // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
//       this.rxQuerySubscription = this.rxQuery.$.pipe(skip(1)).subscribe(async results => {
//          try {
//             await this.mutex.lock('rxQuerySubscribe')
//             this.listUnsubscribe()
//             // rxQuery дергается даже когда поменялся его итем ( даже если это не влияет на рез-тат!!!)
//             // logD(f, 'rxQuery changed 1', results)
//             if (this.vm.reactiveList.length === results.length) {
//                let arrayChanged = false
//                for (let i = 0; i < results.length; i++) {
//                   if (results[i].id !== this.vm.reactiveList[i].id) {
//                      arrayChanged = true
//                      break
//                   }
//                }
//                if (!arrayChanged) return // если список не изменился - просто выходим
//             }
//             // logD(f, 'rxQuery changed 2', results)
//             let items = results.map(rxDoc => {
//                let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
//                return reactiveItemHolder.reactiveItem
//             })
//             this.vm.reactiveList.splice(0, this.vm.reactiveList.length, ...items)
//          } finally {
//             this.listSubscribe()
//             this.mutex.release()
//          }
//       })
//    }
//
//    rxQueryUnsubscribe () {
//       if (this.rxQuerySubscription) this.rxQuerySubscription.unsubscribe()
//       delete this.rxQuerySubscription
//    }
//
//    listSubscribe () {
//       const f = this.listSubscribe
//       if (this.listUnsubscribeFunc) return
//       this.listUnsubscribeFunc = this.vm.$watch('reactiveList', async (newVal, oldVal) => {
//          // assert(false, 'изменения списка из UI запрещены')
//          // // reactiveList изменился (из UI)
//          // if (!this.debouncedListSave) {
//          //   this.debouncedListSave = debounce(async (newVal, oldVal) => {
//          //     const f = this.debouncedListSave
//          //     try {
//          //       await this.mutex.lock('listUnsubscribeFunc')
//          //       await rxdb.lock('listUnsubscribeFunc') // необходимо заблокировать до вызова this.rxQueryUnsubscribe() (иначе могут быть пропущены эвенты изменения rxDoc из сети)
//          //       this.rxQueryUnsubscribe()
//          //       logD(f, 'reactiveList changed from UI', newVal)
//          //       let insertedItems = difference(newVal, oldVal, (left, right) => left.id === right.id) // что добавилось в массив
//          //       let deletedItems = difference(oldVal, newVal, (left, right) => left.id === right.id) // что удалено из массива
//          //
//          //       for (let insertedItem of insertedItems) {
//          //         assert(!insertedItem.id)
//          //         await rxdb.upsertItem(insertedItem) // сохраним в БД
//          //       }
//          //       for (let deletedItem of deletedItems) {
//          //         assert(deletedItem.id)
//          //         await rxdb.delete(deletedItem.id) // сохраним в БД
//          //       }
//          //     } finally {
//          //       this.rxQuerySubscribe()
//          //       this.rxdb.release()
//          //       this.mutex.release()
//          //     }
//          //   }, debounceIntervalList)
//          // }
//          // this.debouncedListSave(newVal, oldVal)
//       }, { deep: false, immediate: false })
//    }
//
//    listUnsubscribe () {
//       if (this.listUnsubscribeFunc) this.listUnsubscribeFunc()
//       delete this.listUnsubscribeFunc
//    }
// }

class ReactiveListHolderWithPagination {
   async create (rxQueryOrRxDoc, populateFunc) {
      assert(isRxQuery(rxQueryOrRxDoc) || isRxDocument(rxQueryOrRxDoc), '!isRxQuery(rxQuery)')
      try {
         if (rxQueryOrRxDoc.reactiveListHolderMaster) {
            await rxQueryOrRxDoc.reactiveListHolderMaster.mutex.lock('ReactiveListHolder::create')
            this.reactiveListFull = rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListFull
            this.reactiveListPagination = rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListPagination
            this.next = rxQueryOrRxDoc.reactiveListHolderMaster.next
            this.getProperty = rxQueryOrRxDoc.reactiveListHolderMaster.getProperty
            this.setProperty = rxQueryOrRxDoc.reactiveListHolderMaster.setProperty
            assert(this.reactiveListFull && this.reactiveListPagination, '!this.reactiveListFull!')
         } else {
            this.mutex = new MutexLocal('ReactiveListHolder::constructor')
            await this.mutex.lock('ReactiveListHolder::create')
            rxQueryOrRxDoc.reactiveListHolderMaster = this
            if (isRxQuery(rxQueryOrRxDoc)) {
               this.rxQuery = rxQueryOrRxDoc
               logD('ReactiveListHolder::constructor: ', this.rxQuery.mangoQuery.selector)
            } else if (isRxDocument(rxQueryOrRxDoc)) {
               this.rxDoc = rxQueryOrRxDoc
               logD('ReactiveListHolder::constructor: ', this.rxDoc.id)
            } else throw new Error('bad rxQueryOrRxDoc')
            assert(this.rxQuery || this.rxDoc, '!this.rxQuery || this.rxDoc')

            let listItems
            if (this.rxQuery) { // мастерская (элементы в списке [WS_ITEM])
               assert(this.rxQuery.collection.name === 'ws_items', '!this.rxQuery.collection.name === ws_items')
               let rxDocs = await this.rxQuery.exec()
               assert(rxDocs && Array.isArray(rxDocs), '!rxDoc && Array.isArray(rxDoc)')
               listItems = rxDocs.map(rxDoc => getReactive(rxDoc))
            } else if (this.rxDoc) { // лента полученная с сервера {items, count, totalCount}
               listItems = this.rxDoc.toJSON().cached.data.items
            } else throw new Error('bad collection' + this.rxQuery.collection.name)
            assert(listItems && Array.isArray(listItems), 'Array.isArray(listItems)')
            this.vm = new Vue({
               data: {
                  reactiveListFull: listItems,
                  reactiveListPagination: []
               }
            })
            this.reactiveListFull = this.vm.reactiveListFull
            this.reactiveListPagination = this.vm.reactiveListPagination
            assert(Array.isArray(this.vm.reactiveListFull) && Array.isArray(this.vm.reactiveListPagination), 'Array.isArray(this.vm.reactiveListFull)')
            this.rxQuerySubscribe()
            this.listSubscribe()

            this.nextIndex = 0 // первая незаполненная позиция
            this.nextPageIndex = 0 // позиция, с которой начинается след страница
            this.props = {}
            this.populateFunc = populateFunc
            // setProperty / getProperty - хранение метаинформации на списке (currentIndex, итд)
            this.reactiveListPagination.setProperty = (name, value) => {
               this.props[name] = value
            }
            this.reactiveListPagination.getProperty = (name) => this.props[name]
            this.reactiveListPagination.next = async (count) => {
               if (!count && this.nextIndex === 0) { // autoNext
                  if (this.populateFunc) count = 8
                  else count = this.reactiveListFull.length
               }
               this.nextPageIndex = this.nextIndex + count
               if (this.nextIndex >= this.reactiveListFull.length) return false // дошли до конца списка
               let fromIndex = this.nextIndex
               this.nextIndex = this.nextIndex + count
               let nextItems = this.reactiveListFull.slice(fromIndex, this.nextIndex)
               let prefetchItems = this.reactiveListFull.slice(this.nextIndex, this.nextIndex + 4) // упреждпющее чтение
               if (this.populateFunc) nextItems = await this.populateFunc(nextItems, prefetchItems) // запрашиваем полные сущности
               this.vm.reactiveListPagination.splice(this.vm.reactiveListPagination.length, 0, ...nextItems)
               return this.nextIndex < this.reactiveListFull.length
            }
         }
      } finally {
         if (rxQueryOrRxDoc.reactiveListHolderMaster) {
            rxQueryOrRxDoc.reactiveListHolderMaster.mutex.release()
         } else {
            this.mutex.release()
         }
      }
      assert(this.reactiveListPagination, '!this.reactiveListPagination!')
      return this.reactiveListPagination
   }

   rxQuerySubscribe () {
      const f = this.rxQuerySubscribe
      if (this.rxSubscription) return
      if (this.rxQuery) {
         // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
         this.rxSubscription = this.rxQuery.$.pipe(skip(1)).subscribe(async results => {
            try {
               await this.mutex.lock('List::rxQuerySubscribe')
               this.listUnsubscribe()
               // rxQuery дергается даже когда поменялся его итем ( даже если это не влияет на рез-тат!!!)
               // logD(f, 'rxQuery changed 1', results)
               if (this.vm.reactiveListFull.length === results.length) {
                  let arrayChanged = false
                  for (let i = 0; i < results.length; i++) {
                     if (results[i].id !== this.vm.reactiveListFull[i].id) {
                        arrayChanged = true
                        break
                     }
                  }
                  if (!arrayChanged) return // если список не изменился - просто выходим
               }
               // logD(f, 'rxQuery changed 2', results)
               let listItems = results.map(rxDoc => getReactive(rxDoc))
               this.vm.reactiveListFull.splice(0, this.vm.reactiveListFull.length, ...listItems)
               this.vm.reactiveListPagination.splice(0, this.vm.reactiveListPagination.length, ...this.vm.reactiveListFull.slice(0, this.nextIndex))
               this.vm.reactiveListPagination.next(3) // если nextIndex === 0, то никто не узнает что можно вызывать next()
            } finally {
               this.listSubscribe()
               this.mutex.release()
            }
         })
      } else if (this.rxDoc) {
         this.rxSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
            try {
               await this.mutex.lock('List::rxDocSubscribe') // обязательно сначала блокируем !!! (см itemSubscribe)
               this.listUnsubscribe()
               logD(f, 'List::rxDoc changed. try to change reactiveListFull')
               assert(change.cached.data.items && Array.isArray(change.cached.data.items), '!change.items && Array.isArray(change.items)')
               this.vm.reactiveListFull.splice(0, this.vm.reactiveListFull.length, ...change.cached.data.items)
               let nextItems = this.reactiveListFull.slice(0, this.nextPageIndex)
               if (this.populateFunc) nextItems = await this.populateFunc(nextItems) // запрашиваем полные сущности
               this.vm.reactiveListPagination.splice(0, this.vm.reactiveListPagination.length, ...nextItems)
            } finally {
               this.listSubscribe()
               this.mutex.release()
            }
         })
      } else throw new Error('!this.rxQuery && !this.rxDoc')
   }

   rxUnsubscribe () {
      if (this.rxSubscription) this.rxSubscription.unsubscribe()
      delete this.rxSubscription
   }

   listSubscribe () {
      const f = this.listSubscribe
      if (this.listUnsubscribeFunc) return
      this.listUnsubscribeFunc = this.vm.$watch('reactiveListFull', async (newVal, oldVal) => {
         logD('изменения списка из UI!')
         // assert(false, 'изменения списка из UI запрещены')
      }, { deep: false, immediate: false })
   }

   listUnsubscribe () {
      if (this.listUnsubscribeFunc) this.listUnsubscribeFunc()
      delete this.listUnsubscribeFunc
   }
}

export { ReactiveItemHolder, ReactiveListHolderWithPagination, getReactive, updateRxDoc }
