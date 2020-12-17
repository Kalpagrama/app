import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import lodashGet from 'lodash/get'
import { wait } from 'src/system/utils'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { Lists } from 'src/system/rxdb/lists'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_REACTIVE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_REACTIVE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_REACTIVE)

function getReactiveDoc (rxDoc) {
   let reactiveDocFactory = new ReactiveDocFactory(rxDoc)
   return reactiveDocFactory.getReactiveDoc()
}

// все изменения rxDoc - только через эту ф-ю!!! Иначе - возможны гонки (из-за debounce)
// либо - менять непосредственно reactiveDoc.payload(payload.prop = ...) (либо через reactiveItem.updateExtended)
// synchro - синхронить эти изменения на сервер
async function updateRxDocPayload (rxDocOrId, path, valueOrFunc, debouncedSave = true, synchro = true) {
   const f = updateRxDocPayload
   logD(f, 'start')
   const t1 = performance.now()
   // logD(f, 'start2', rxDocOrId, path, valueOrFunc)
   assert(rxDocOrId, '!(rxDocOrId)')
   if (!rxDocOrId) return
   let rxDoc
   if (isRxDocument(rxDocOrId)) {
      rxDoc = rxDocOrId
   } else {
      // rxDoc = await rxdb.getRxDoc(rxDocOrId) так нельзя (будет запрашивать отсутствующие)
      rxDoc = await rxdb.cache.get(rxDocOrId) // берем только те что есть в кэше ( с сервера не запрашиваем)
   }
   if (rxDoc) {
      let reactiveDocFactory = new ReactiveDocFactory(rxDoc)
      let reactiveDoc = reactiveDocFactory.getReactiveDoc()
      try {
         reactiveDocFactory.setDebouncedSave(debouncedSave)
         reactiveDocFactory.setSynchro(synchro)
         let value
         if (typeof valueOrFunc === 'function') {
            let changedData = lodashGet(JSON.parse(JSON.stringify(reactiveDoc.getPayload() || null)), path, null)
            value = valueOrFunc(changedData)
            assert(value, '!value')
         } else value = valueOrFunc
         reactiveDoc.updatePayloadByPath(path, value)
      } finally {
         wait(0).then(() => { // нужно чтобы setDebouncedSave сработала после эвентов reactiveDocSubscribe
            reactiveDocFactory.setDebouncedSave(true)
            reactiveDocFactory.setSynchro(true)
         })
      }
   }
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

const debounceIntervalItem = 2000 // дебаунс сохранения реактивных элементов в rxdb

// класс-обертка над rxDoc для реактивности
class ReactiveDocFactory {
   constructor (rxDoc) {
      assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
      assert(rxDoc.id, '!rxDoc.id')
      // logD('ReactiveDocFactory::constructor', rxDoc.id)
      if (rxDoc.wsItemType) this.itemType = 'wsItem'
      else if (rxDoc.cached) this.itemType = 'object'
      else if (rxDoc.valueString) this.itemType = 'meta'
      else throw new Error('bad itemType')
      if (rxDoc.reactiveItemHolderMaster) {
         this.getReactiveDoc = rxDoc.reactiveItemHolderMaster.getReactiveDoc
         // this.setReactiveDoc = rxDoc.reactiveItemHolderMaster.setReactiveDoc
         // this.reactiveDocSubscribe = rxDoc.reactiveItemHolderMaster.reactiveDocSubscribe
         // this.reactiveDocUnsubscribe = rxDoc.reactiveItemHolderMaster.reactiveDocUnsubscribe
         // this.rxDocSubscribe = rxDoc.reactiveItemHolderMaster.rxDocSubscribe
         // this.rxDocUnsubscribe = rxDoc.reactiveItemHolderMaster.rxDocUnsubscribe
         // this.getRev = rxDoc.reactiveItemHolderMaster.getRev
         // this.setRev = rxDoc.reactiveItemHolderMaster.setRev
         this.getDebouncedSave = rxDoc.reactiveItemHolderMaster.getDebouncedSave
         this.setDebouncedSave = rxDoc.reactiveItemHolderMaster.setDebouncedSave
         this.getSynchro = rxDoc.reactiveItemHolderMaster.getSynchro
         this.setSynchro = rxDoc.reactiveItemHolderMaster.setSynchro
      } else {
         this.rxDoc = rxDoc
         this.mutex = new MutexLocal('ReactiveDocFactory::constructor')
         this.vm = new Vue({
            data: {
               reactiveData: {},
               rev: rxDoc._rev
            }
         })
         this.debouncedSave = true
         this.synchro = true
         this.getReactiveDoc = () => {
            assert(this.vm.reactiveData.doc, '!this.vm.reactiveData.doc')
            return this.vm.reactiveData.doc
         }
         this.setReactiveDoc = (plainData) => {
            assert(plainData && typeof plainData === 'object', '!typeof plainData === object') // сейчас plainData - всегда объект (даже для META)
            const reactiveDoc = plainData
            reactiveDoc.getPayload = () => {
               switch (this.itemType) {
                  case 'wsItem':
                     return reactiveDoc // wsSchemaItem
                  case 'object':
                     return reactiveDoc.cached.data // cacheSchema
                  case 'meta':
                     return reactiveDoc.valueString // schemaKeyValue
                  default:
                     throw new Error('bad itemType: ' + this.itemType)
               }
            }
            const payload = reactiveDoc.getPayload()
            reactiveDoc.updatePayloadByPath = (payloadPath, value) => {
               // if (this.itemType.in('wsItem', 'object')) {
               //    assert(payloadPath, '!payloadPath')
               //    let propPathParent = payloadPath.split('.').slice(0, -1).join('.')
               //    let changedPropName = payloadPath.split('.').slice(-1).join('.')
               //    let valueParent = propPathParent === '' ? payload : lodashGet(payload, payloadPath.split('.').slice(0, -1).join('.')) // родитель измененного свойства
               //    if (valueParent) {
               //       Vue.set(valueParent, changedPropName, value)
               //    } else logE(`cant find prop ${payloadPath} in object`, payload)
               // } else if (this.itemType.in('meta')) {
               //    assert(payloadPath === '', '!payloadPath === emptyStr')
               //    Vue.set(reactiveDoc, 'valueString', value)
               // } else throw new Error('bad itemType: ' + this.itemType)
               let fullPath
               switch (this.itemType) {
                  case 'wsItem':
                     fullPath = payloadPath || '.'
                     break
                  case 'object':
                     fullPath = `cached.data${payloadPath ? '.' + payloadPath : ''}`
                     break
                  case 'meta':
                     assert(typeof value === 'string')
                     fullPath = 'valueString'
                     break
                  default:
                     throw new Error('bad itemType: ' + this.itemType)
               }
               // ws: subscriber.name
               let propPathParent = fullPath.split('.').slice(0, -1).join('.')
               let changedPropName = fullPath.split('.').slice(-1).join('.')
               let valueParent = propPathParent ? lodashGet(reactiveDoc, propPathParent) : reactiveDoc // родитель измененного свойства
               if (valueParent) {
                  ReactiveDocFactory.mergeReactive(valueParent, { [changedPropName]: value })
               } else logE(`cant find prop ${fullPath} in object`, reactiveDoc)
            }

            if (typeof payload === 'object') {
               payload.updateExtended = async (path, value, debouncedSave = true, synchro = true) => {
                  await updateRxDocPayload(this.rxDoc, path, value, debouncedSave, synchro)
               }
               if (payload.wsItemType) {
                  payload.remove = async (permanent = false) => {
                     if (payload.beforeRemove) await payload.beforeRemove(permanent)
                     if (permanent) await this.rxDoc.remove()
                     else await updateRxDocPayload(this.rxDoc, 'deletedAt', Date.now(), false)
                  }
                  payload.restoreFromTrash = async () => {
                     await updateRxDocPayload(this.rxDoc, 'deletedAt', 0, false)
                  }
                  rxdb.workspace.populateReactiveWsItem(payload)
               }
            }
            Vue.set(this.vm.reactiveData, 'doc', reactiveDoc)
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
         this.setReactiveDoc(rxDoc.toJSON())
         this.rxDocSubscribe()
         this.reactiveDocSubscribe()
         rxDoc.reactiveItemHolderMaster = this
      }
   }

   static mergeReactive (state, value, propName, ignoreNull) {
      // eslint-disable-next-line no-prototype-builtins
      if (Object.prototype.toString.call(value) === '[object Object]' && (propName == null || state.hasOwnProperty(propName))) {
         const o = propName == null ? state : state[propName];
         if (o != null) {
            for (let prop in value) {
               ReactiveDocFactory.mergeReactive(o, value[prop], prop, ignoreNull);
            }
            return;
         }
      }
      if (!ignoreNull || value !== null) Vue.set(state, propName, value);
   }

   rxDocSubscribe () {
      const f = this.rxDocSubscribe
      // logD(f, `rxDoc subscribe ${this.rxDoc.id} rev: ${this.rxDoc.rev}`)
      if (this.rxDocSubscription) return
      // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
      this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async changePlainDoc => {
         try {
            // logD(f, 'reactiveDoc changed start', changePlainDoc)
            await this.mutex.lock('rxDocSubscribe') // обязательно сначала блокируем !!! (см reactiveDocSubscribe)
            assert(this.getRev() && changePlainDoc._rev, '!this.getRev() && changePlainDoc._rev')
            if (this.getRev() === changePlainDoc._rev) return // изменения уже применены к reactiveDoc (см this.reactiveDocSubscribe())
            this.reactiveDocUnsubscribe()
            ReactiveDocFactory.mergeReactive(this.getReactiveDoc(), changePlainDoc)
            this.setRev(changePlainDoc._rev)
            // logD(f, 'reactiveDoc changed stop')
         } finally {
            this.reactiveDocSubscribe()
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

   reactiveDocSubscribe () {
      const f = this.reactiveDocSubscribe
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
                  await this.mutex.lock('reactiveDocSubscribe') // обязательно сначала блокируем !!! (см rxDocSubscribe)
                  // this.rxDocUnsubscribe() !!!! --- не отписываемся от изменения тк может быть более одного документа rxDoc ( и на каждый - свой reactiveItem!) работает this._rev
                  // logD(f, `try to change rxDoc ${this.rxDoc.id} ${this._rev} ${this.rxDoc._rev}`)
                  let updatedRxDoc = await this.rxDoc.atomicUpdate((oldData) => {
                     let newData = JSON.parse(JSON.stringify(this.getReactiveDoc())) // убираем реактивную хрень
                     newData._rev = oldData._rev // ревизия от rxdb (иначе - ошибки)
                     if (synchro && this.itemType === 'wsItem') newData.hasChanges = true // итем изменился локально. надо отправить изменеия на сервер
                     return newData
                  })
                  this.setRev(updatedRxDoc._rev)
                  // logD(f, `rxDoc changed ${updatedRxDoc.id} ${updatedRxDoc._rev}`)
               } finally {
                  // this.rxDocSubscribe()
                  this.mutex.release()
               }
            }
            this.debouncedItemSaveFunc = debounce(this.itemSaveFunc, debounceIntervalItem, { maxWait: 8888 })
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

   reactiveDocUnsubscribe () {
      const f = this.reactiveDocUnsubscribe
      if (this.itemUnsubscribeFunc) this.itemUnsubscribeFunc()
      delete this.itemUnsubscribeFunc
   }
}

class ReactiveListWithPaginationFactory {
   async create (rxQueryOrRxDoc, populateFunc) {
      assert(isRxQuery(rxQueryOrRxDoc) || isRxDocument(rxQueryOrRxDoc), '!isRxQuery(rxQuery)')
      if (rxQueryOrRxDoc.reactiveListHolderMaster) {
         // this.reactiveListFull = rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListFull
         // this.reactiveListPagination = rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListPagination
      } else {
         this.mutex = new MutexLocal('ReactiveListHolder::create')
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
            listItems = rxDocs.map(rxDoc => getReactiveDoc(rxDoc))
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
            if (this.populateFunc && count > 12) {
               logW('next allow only 12 with populate')
               // assert(count <= 12, 'count <= 12! value =' + count)
               count = 12
            } // сервер работает пачками по 16 (12 + побочные запросы)
            if (!count && this.nextIndex === 0) { // autoNext
               if (this.populateFunc) count = 12 // дорогая операция
               else count = this.reactiveListFull.length // выдаем все элементы разом
            }
            this.nextPageIndex = this.nextIndex + count
            if (this.nextIndex >= this.reactiveListFull.length) return false // дошли до конца списка
            let fromIndex = this.nextIndex
            this.nextIndex = this.nextIndex + count
            let nextItems = this.reactiveListFull.slice(fromIndex, this.nextIndex)
            let prefetchItems = []
            if (count < 12) prefetchItems = this.reactiveListFull.slice(this.nextIndex, this.nextIndex + 4) // упреждпющее чтение
            if (this.populateFunc) nextItems = await this.populateFunc(nextItems, prefetchItems) // запрашиваем полные сущности
            let blackLists = await Lists.getBlackLists()
            nextItems = nextItems.filter(obj => !Lists.isElementBlacklisted(obj, blackLists))
            this.vm.reactiveListPagination.splice(this.vm.reactiveListPagination.length, 0, ...nextItems)
            return this.nextIndex < this.reactiveListFull.length
         }
         this.reactiveListPagination.refresh = async () => {
            let blackLists = await Lists.getBlackLists()
            let filtered = this.reactiveListPagination.filter(obj => !Lists.isElementBlacklisted(obj, blackLists))
            this.vm.reactiveListPagination.splice(0, this.vm.reactiveListPagination.length, ...filtered)
         }

         this.rxQuerySubscribe()
         this.reactiveListSubscribe()
      }
      assert(rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListPagination, '!this.reactiveListPagination!')
      return rxQueryOrRxDoc.reactiveListHolderMaster.reactiveListPagination
   }

   rxQuerySubscribe () {
      const f = this.rxQuerySubscribe
      if (this.rxSubscription) return
      if (this.rxQuery) {
         // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
         this.rxSubscription = this.rxQuery.$.pipe(skip(1)).subscribe(async results => {
            try {
               await this.mutex.lock('List::rxQuerySubscribe')
               this.reactiveListUnsubscribe()
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
               let listItems = results.map(rxDoc => getReactiveDoc(rxDoc).getPayload())
               this.vm.reactiveListFull.splice(0, this.vm.reactiveListFull.length, ...listItems)
               this.vm.reactiveListPagination.splice(0, this.vm.reactiveListPagination.length, ...this.vm.reactiveListFull.slice(0, this.nextIndex))
               this.vm.reactiveListPagination.next(3) // если nextIndex === 0, то никто не узнает что можно вызывать next()
            } finally {
               this.reactiveListSubscribe()
               this.mutex.release()
            }
         })
      } else if (this.rxDoc) {
         this.rxSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
            try {
               await this.mutex.lock('List::rxDocSubscribe') // обязательно сначала блокируем !!! (см querySubscribe)
               this.reactiveListUnsubscribe()
               logD(f, 'List::rxDoc changed. try to change reactiveListFull')
               assert(change.cached.data.items && Array.isArray(change.cached.data.items), '!change.items && Array.isArray(change.items)')
               this.vm.reactiveListFull.splice(0, this.vm.reactiveListFull.length, ...change.cached.data.items)
               let nextItems = this.reactiveListFull.slice(0, this.nextPageIndex)
               if (this.populateFunc) nextItems = await this.populateFunc(nextItems, []) // запрашиваем полные сущности
               this.vm.reactiveListPagination.splice(0, this.vm.reactiveListPagination.length, ...nextItems)
            } finally {
               this.reactiveListSubscribe()
               this.mutex.release()
            }
         })
      } else throw new Error('!this.rxQuery && !this.rxDoc')
   }

   rxUnsubscribe () {
      if (this.rxSubscription) this.rxSubscription.unsubscribe()
      delete this.rxSubscription
   }

   reactiveListSubscribe () {
      const f = this.reactiveListSubscribe
      if (this.reactiveListUnsubscribeFunc) return
      this.reactiveListUnsubscribeFunc = this.vm.$watch('reactiveListFull', async (newVal, oldVal) => {
         logD('изменения списка из UI!')
         // assert(false, 'изменения списка из UI запрещены')
      }, { deep: false, immediate: false })
   }

   reactiveListUnsubscribe () {
      if (this.reactiveListUnsubscribeFunc) this.reactiveListUnsubscribeFunc()
      delete this.reactiveListUnsubscribeFunc
   }
}

export { ReactiveDocFactory, ReactiveListWithPaginationFactory, getReactiveDoc, updateRxDocPayload }
