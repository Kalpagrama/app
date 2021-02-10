import Vue from 'vue'
import assert from 'assert'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { makeId, RxCollectionEnum, rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import lodashGet from 'lodash/get'
import { wait } from 'src/system/utils'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { Lists } from 'src/system/rxdb/lists'
import { rxdbOperationProxy } from 'src/system/rxdb/common'
import { Notify } from 'quasar'
import { matNextWeek } from '@quasar/extras/material-icons'

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
   // logD(f, 'start')
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
   // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
                     // await updateRxDocPayload(this.rxDoc, 'deletedAt', Date.now(), false) // ставим всегда (чтобы списки реактивно обновились)
                     if (permanent) await this.rxDoc.remove() // удаляем навсегда (отловим в ws_items.postRemove и отправим на сервер)
                     else await updateRxDocPayload(this.rxDoc, 'deletedAt', Date.now(), false)
                     logD('complete')
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
                  logD(f, `try to change rxDoc ${this.rxDoc.id} ${this._rev} ${this.rxDoc._rev}`)
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

// группа (может содержать элементы либо другие группы)
const GROUP_BATCH_SZ = 12

class Group {
   constructor (id, name, populateFunc = null, paginateFunc = null, propsReactive = {}) {
      assert(id && typeof id === 'string')
      this.paginateFunc = paginateFunc
      this.populateFunc = populateFunc
      this.propsReactive = propsReactive
      assert(this.propsReactive, '!this.propsReactive')
      this.vm = new Vue({
         data: {
            reactiveGroup: {
               id,
               name,
               pages: [], // вся лента разбита на пагинированные блоки(страницы)
               items: [], // кусочек от this.pages (для каждого item вызывается populate)
               itemPrimaryKey: null, // имя поля в item (обычно либо 'oid' либо 'id')
               totalCount: 0,
               itemType: 'ITEM', // ITEM / GROUP (внутри группы мб подгруппы)
               gotoCurrent: this.gotoCurrent.bind(this),
               gotoStart: this.gotoStart.bind(this),
               gotoEnd: this.gotoEnd.bind(this),
               // next: this.next.bind(this),
               // prev: this.prev.bind(this),
               next: debounce(this.next.bind(this), 1000, { leading: true, maxWait: 8888 }),
               prev: debounce(this.prev.bind(this), 1000, { leading: true, maxWait: 8888 }),
               hasNext: false,
               hasPrev: false,
               newItemsBelow: 0, // в списке появились новые элементы выше
               newItemsAbove: 0, // в списке появились новые элементы ниже
               setProperty: this.setProperty.bind(this),
               getProperty: this.getProperty.bind(this),
               refresh: this.refresh.bind(this)
            }
         }
      })
      this.reactiveGroup = this.vm.reactiveGroup
      this.updateReactiveGroup = () => {
         this.reactiveGroup.hasNext = this.hasNext()
         this.reactiveGroup.hasPrev = this.hasPrev()

         // пытаемся понять - не добавилось ли сверху или снизу элементов
         let currentId = this.getProperty('currentId')
         if (currentId) {
            let currentAbsoluteIndx = this.getAbsoluteIndex(this.findIndx(currentId))
            let currentTotalCount = this.reactiveGroup.totalCount
            let currentAbsoluteIndxSaved = this.getProperty('currentAbsoluteIndx')
            let currentTotalCountSaved = this.getProperty('currentTotalCount')
            if (currentAbsoluteIndx >= 0 && currentAbsoluteIndxSaved) {
               let topDiff = currentAbsoluteIndx - currentAbsoluteIndxSaved // добавилось / удалилось сверху
               this.reactiveGroup.newItemsBelow = Math.max(topDiff, 0)
               let bottomDif = (currentTotalCount - currentTotalCountSaved) - topDiff
               this.reactiveGroup.newItemsAbove = Math.max(bottomDif, 0)
            }
         }
         // this.getAbsoluteIndex(this.findIndx(value)
         // this.setProperty('currentAbsoluteIndx', value ? this.getAbsoluteIndex(this.findIndx(value)) : -1) // индекс с учетом серверной пагинации
         // this.setProperty('currentTotalCount', this.reactiveGroup.totalCount)
         let currentAbsoluteIndx
      }
   }

   // подписаться на обновления rxDoc
   rxQuerySubscribe (rxQueryOrRxDocOrArray) {
      const f = this.rxQuerySubscribe
      let rxQuery, rxDoc, array
      if (isRxQuery(rxQueryOrRxDocOrArray)) {
         rxQuery = rxQueryOrRxDocOrArray
         // logD('ReactiveListHolder::constructor: ', rxQuery.mangoQuery.selector)
      } else if (isRxDocument(rxQueryOrRxDocOrArray)) {
         rxDoc = rxQueryOrRxDocOrArray
         // logD('ReactiveListHolder::constructor: ', rxDoc.id)
      } else if (Array.isArray(rxQueryOrRxDocOrArray)) {
         array = rxQueryOrRxDocOrArray
      } else throw new Error('bad rxQueryOrRxDocOrArray')
      if (rxQuery) {
         // skip - для пропуска n первых эвентов (после subscribe - сразу генерится эвент(даже если данные не менялись))
         let rxSubscription = rxQuery.$.pipe(skip(1)).subscribe(async results => {
            // rxQuery дергается даже когда поменялся его итем ( даже если это не влияет на рез-тат!!!)
            // logD(f, 'rxQuery changed 1', results)
            if (this.loadedLen() === results.length) {
               let arrayChanged = false
               let allItems = this.loadedItems()
               for (let i = 0; i < results.length; i++) {
                  if (results[i][this.reactiveGroup.itemPrimaryKey] !== allItems[i][this.reactiveGroup.itemPrimaryKey]) {
                     arrayChanged = true
                     break
                  }
               }
               if (!arrayChanged) return // если список не изменился - просто выходим
            }
            // logD(f, 'rxQuery changed 2', results)
            let pageItemsNew = results.map(rxDoc => getReactiveDoc(rxDoc).getPayload())
            assert(this.reactiveGroup.pages.length === 1, 'this.reactiveGroup.pages.len != 1')
            let page = this.reactiveGroup.pages[0] // в случае с rxquery - у нас только одна страница
            assert(page, '!page')
            page.pageItems = pageItemsNew // изменились итемы страницы
            this.reactiveGroup.totalCount = pageItemsNew.length
            let { startFullFil, endFullFil } = this.fulFilledRange()
            if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
               startFullFil = 0
               endFullFil = 11
            }
            let nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
            await this.fulfill(nextItems, 'whole')
         })
      } else if (rxDoc) {
         // в список были добавлены элементы(например при подписке)
         let rxSubscription = rxDoc.$.pipe(skip(1)).subscribe(async change => {
            logD(f, 'List::rxDoc changed. try to change this.pageItems')
            assert(change.cached.data.items && Array.isArray(change.cached.data.items), '!change.items && Array.isArray(change.items)')
            await this.upsertPaginationPage(rxDoc, null, change.id, false)
            let { startFullFil, endFullFil } = this.fulFilledRange()
            if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
               endFullFil = startFullFil = 0
            }
            let nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
            await this.fulfill(nextItems, 'whole')
            let thiz = this
            logD('thiz', thiz)
         })
      }
   }

   async upsertPaginationPage (rxQueryOrRxDocOrArray, position, updatedPageId = null, subscribe = true) {
      const f = this.upsertPaginationPage
      assert(isRxQuery(rxQueryOrRxDocOrArray) || isRxDocument(rxQueryOrRxDocOrArray) || Array.isArray(rxQueryOrRxDocOrArray), 'bad rxQueryOrRxDocOrArray')
      assert((!position && updatedPageId) || position.in('top', 'bottom', 'whole'), 'bad position')
      let rxQuery, rxDoc, array
      if (isRxQuery(rxQueryOrRxDocOrArray)) rxQuery = rxQueryOrRxDocOrArray
      else if (isRxDocument(rxQueryOrRxDocOrArray)) rxDoc = rxQueryOrRxDocOrArray
      else if (Array.isArray(rxQueryOrRxDocOrArray)) array = rxQueryOrRxDocOrArray
      else throw new Error('bad rxQueryOrRxDocOrArray')
      assert(rxQuery || rxDoc || array, '!this.rxQuery || this.rxDoc')
      let totalCount, itemType, itemPrimaryKey // данные списка
      let pageId, pageItems, nextPageToken, prevPageToken, currentPageToken // данные текущей страницы
      if (rxQuery) { // мастерская (элементы в списке [WS_ITEM])
         assert(rxQuery.collection.name === 'ws_items', '!this.rxQuery.collection.name === ws_items')
         let mangoQuery = rxQuery.mangoQuery
         assert(mangoQuery, '!mangoQuery')
         let rxDocs = await rxQuery.exec()
         assert(rxDocs && Array.isArray(rxDocs), '!rxDoc && Array.isArray(rxDoc)')
         pageId = JSON.stringify(mangoQuery)
         pageItems = rxDocs.map(rxDoc => getReactiveDoc(rxDoc))
         totalCount = pageItems.length
         itemType = mangoQuery.selector.groupByContentLocation ? 'GROUP' : 'ITEM'
         itemPrimaryKey = 'id'
      } else if (rxDoc) { // лента полученная с сервера {items, count, totalCount}
         let {
            items,
            totalCount: totalCount_,
            nextPageToken: nextPageToken_,
            prevPageToken: prevPageToken_,
            currentPageToken: currentPageToken_
         } = rxDoc.toJSON().cached.data
         let mangoQuery = rxDoc.props.mangoQuery
         assert(mangoQuery, '!mangoQuery')
         assert(mangoQuery.selector.rxCollectionEnum, '!rxCollectionEnum')
         pageId = rxDoc.id
         pageItems = items
         totalCount = totalCount_
         nextPageToken = nextPageToken_
         prevPageToken = prevPageToken_
         currentPageToken = currentPageToken_
         // для групп - назначаем id для каждой группы
         for (let item of pageItems) {
            if (item.__typename === 'Group') {
               assert(item.figuresAbsolute, '!item.figuresAbsolute')
               assert(item.items, '!group.items')
               item.id = JSON.stringify(item.figuresAbsolute)
            }
         }
         // не показываем пустые группы
         pageItems = pageItems.filter(item => {
            if (item.__typename === 'Group' && !item.items.length) return false
            return true
         })
         if (mangoQuery.selector.groupByContentLocation) {
            itemType = 'GROUP'
            itemPrimaryKey = 'id'
         } else {
            itemType = 'ITEM'
            // itemPrimaryKey
            switch (mangoQuery.selector.rxCollectionEnum) {
               case RxCollectionEnum.LST_SPHERE_ITEMS:
               case RxCollectionEnum.LST_SEARCH:
               case RxCollectionEnum.LST_SUBSCRIBERS:
               case RxCollectionEnum.LST_SUBSCRIPTIONS:
                  itemPrimaryKey = 'oid'
                  break
               case RxCollectionEnum.LST_FEED:
                  itemPrimaryKey = 'id' // эвенты
                  break
               default:
                  throw new Error('bad rxDoc.props.mangoQuery.selector.rxCollectionEnum: ' + mangoQuery.selector.rxCollectionEnum)
            }
         }
      } else if (array) {
         pageId = 'custom array'
         pageItems = array
         totalCount = pageItems.length
         itemType = 'ITEM' // todo определять тип итемов внутри (возможно позже там могут быть и группы)
         if (pageItems.length) {
            if (pageItems[0].oid) itemPrimaryKey = 'oid'
            else if (pageItems[0].id) itemPrimaryKey = 'id'
         } else itemPrimaryKey = 'unknown'
      } else throw new Error('bad rxQueryOrRxDocOrArray')
      assert(pageId, '!pageId')
      assert(totalCount >= 0, '!totalCount')
      assert(itemType && itemType.in('GROUP', 'ITEM'), 'bad itemType')
      assert(itemPrimaryKey, '!itemPrimaryKey')
      assert(pageItems && Array.isArray(pageItems), 'Array.isArray(pageItems)')

      // обновляем данные списка в сответствии с уточненными данными
      this.reactiveGroup.totalCount = totalCount
      this.reactiveGroup.itemType = itemType
      this.reactiveGroup.itemPrimaryKey = itemPrimaryKey
      let page = {
         pageItems,
         pageId,
         nextPageToken,
         prevPageToken,
         currentPageToken,
         currentPageSize: Math.max(pageItems.length, GROUP_BATCH_SZ)
      }
      if (updatedPageId) { // обновить страницу
         let pageIndx = this.reactiveGroup.pages.findIndex(pg => pg.pageId === updatedPageId)
         if (pageIndx >= 0) this.reactiveGroup.pages.splice(pageIndx, 1, page)
      } else if (position === 'top') { // добавить сверху
         this.reactiveGroup.pages.unshift(page)
         assert(page.currentPageToken, '!currentPageToken')
         assert(page.currentPageToken.indx >= 0 && page.currentPageToken.direction === 'BACKWARD', ' bad currentPageToken1')
         // поправить indx для pages сверху и снизу
      } else if (position === 'bottom') { // добавить снизу
         this.reactiveGroup.pages.push(page)
         assert(page.currentPageToken, '!currentPageToken')
         assert(page.currentPageToken.indx >= 0 && page.currentPageToken.direction === 'FORWARD', ' bad currentPageToken2')
      } else if (position === 'whole') {
         assert(this.reactiveGroup.pages.length === 0, 'this.reactiveGroup.pages.let > 0')
         this.reactiveGroup.pages.push(page)
      } else throw new Error('bad position' + position)
      if (subscribe) this.rxQuerySubscribe(rxQueryOrRxDocOrArray)
   }

   async refresh () {
      await this.fulfill(this.reactiveGroup.items, 'whole')
   }

   loadedLen () {
      let len = 0
      for (let page of this.reactiveGroup.pages) {
         len += page.pageItems.length
      }
      return len
   }

   loadedItems () {
      let res = []
      for (let page of this.reactiveGroup.pages) res.push(...page.pageItems)
      return res
   }

   // диапазон из loadedItems, загруженный в reactiveListFulFilled
   fulFilledRange () {
      let loadedList = this.loadedItems()
      // ищет начало reactiveListFulFilled в loadedList
      let findStart = () => {
         let searchIndx = 0
         let indx = -1
         while (searchIndx < this.reactiveGroup.items.length && indx === -1) {
            let searchId = this.reactiveGroup.items[searchIndx].oid || this.reactiveGroup.items[searchIndx].id
            indx = loadedList.findIndex(item => item.oid === searchId || item.id === searchId)
            searchIndx++ // ищем дальше
         }
         return indx
      }
      // ищет конец reactiveListFulFilled в loadedList
      let findEnd = () => {
         let searchIndx = this.reactiveGroup.items.length - 1
         let indx = -1
         while (searchIndx >= 0 && indx === -1) {
            let searchId = this.reactiveGroup.items[searchIndx].oid || this.reactiveGroup.items[searchIndx].id
            indx = loadedList.findIndex(item => item.oid === searchId || item.id === searchId)
            searchIndx-- // ищем дальше
         }
         return indx
      }
      // область из loadedList, загруженная в reactiveListFulFilled
      let startFullFil = findStart()
      let endFullFil = findEnd()
      if (startFullFil === -1) assert(endFullFil === -1, 'endFullFil === -1')
      if (endFullFil === -1) assert(startFullFil === -1, 'startFullFil === -1')
      assert(endFullFil >= startFullFil, 'logic error end < start' + startFullFil + ':' + endFullFil)
      return { startFullFil, endFullFil }
   }

   // заполнить итоговый массив
   async fulfill (nextItems, position) {
      assert(position.in('top', 'bottom', 'whole'), 'bad position')
      // let isGroupedList = (items) => items.length && items[0].items
      let startPos = position === 'bottom' ? this.reactiveGroup.items.length : 0
      let deleteCount = position === 'whole' ? this.reactiveGroup.items.length : 0
      assert(startPos >= 0 && nextItems && Array.isArray(nextItems), 'bad fulfill params')
      if (this.reactiveGroup.itemType === 'GROUP') {
         let makeNextGroup = async (nextGroup) => {
            let {
               id: groupId,
               name: groupName,
               items,
               totalCount,
               nextPageToken,
               prevPageToken,
               currentPageToken,
               figuresAbsolute,
               thumbUrl
            } = nextGroup
            assert(groupId, '!groupId')
            assert(groupName, '!groupName')
            // if (!items || !totalCount) {
            //    logD('asdfasdfsadfsadf')
            // }
            assert(items && totalCount >= 0, '!nextItem.items')
            assert(nextGroup.totalCount >= 0, '!nextItem.totalCount')
            Vue.set(this.propsReactive, '')
            let group = new Group(groupId, groupName, this.populateFunc, null, this.propsReactive)
            Vue.set(group.reactiveGroup, 'figuresAbsolute', figuresAbsolute)
            Vue.set(group.reactiveGroup, 'thumbUrl', thumbUrl)
            Vue.set(group.reactiveGroup, 'nextPageToken', nextPageToken)
            Vue.set(group.reactiveGroup, 'prevPageToken', prevPageToken)
            Vue.set(group.reactiveGroup, 'currentPageToken', currentPageToken)
            await group.upsertPaginationPage(items, 'whole')
            await group.next(this.populateFunc ? 3 : null) // сразу грузим по 3 ядра в группе (исли нужны полные сущности)
            return group.reactiveGroup
         }
         nextItems = await Promise.all(nextItems.map(nextGroup => makeNextGroup(nextGroup)))
      } else {
         if (this.populateFunc) { // запрашиваем полные сущности
            nextItems = await this.populateFunc(nextItems, [], this.reactiveGroup.items)
         }
      }
      let blackLists = await Lists.getBlackLists()
      let filtered = nextItems.filter(obj => !Lists.isElementBlacklisted(obj, blackLists))

      // this.reactiveGroup.items.splice(startPos, deleteCount, ...filtered) -- так не делаем чтобы не менять массив дважды

      let itemsCopy = this.reactiveGroup.items.slice(0, this.reactiveGroup.items.length) // делаем копию для того чтобы список обновился только 1 раз
      itemsCopy.splice(startPos, deleteCount, ...filtered) // добавляем новые

      // максимум 36 элементов (если больше - то отрезаем верх или низ)
      // отрезать надо тк при большик кол-вах реактивных элементов запросы в rxDB начинают выполнятся очень долго!
      if (position === 'top') {
         itemsCopy.splice(36, itemsCopy.length)
      } else if (position === 'bottom') {
         itemsCopy.splice(0, Math.max(0, itemsCopy.length - 36))
      }
      this.reactiveGroup.items.splice(0, this.reactiveGroup.items.length, ...itemsCopy) // реактивно обновляем 1 раз

      this.updateReactiveGroup()
   }

   // найдет элемент в списке (поиск идет и вглубь (не важно на каком уровне находится элемент))
   findIndx (currentId, findInDeep = true) {
      let indxFrom = -1
      let findItemIndex = (items, id) => {
         let indx = items.findIndex(item => item[this.reactiveGroup.itemPrimaryKey] === id)
         if (indx === -1 && findInDeep) { // на этом уровне currentId не найден (идем вглубь)
            for (let i = 0; i < items.length; i++) {
               let subitems = items[i].items
               if (subitems) {
                  if (findItemIndex(subitems, id) >= 0) {
                     indx = i
                     break
                  }
               }
            }
         }
         return indx
      }
      if (currentId)indxFrom = findItemIndex(this.loadedItems(), currentId)
      return indxFrom
   }

   findPage (localIndex) {
      let pageStartIndxLocal = 0
      for (let page of this.reactiveGroup.pages) {
         if (localIndex < pageStartIndxLocal + page.pageItems.length) return { page, pageStartIndxLocal }
         pageStartIndxLocal += page.pageItems.length
      }
      return {}
   }

   // индекс с учетом серверной пагинации (localIndex - индекс в загруженных страницах)
   getAbsoluteIndex (localIndex) {
      if (!(localIndex >= 0)) return -1
      let { page, pageStartIndxLocal } = this.findPage(localIndex)
      assert(page && pageStartIndxLocal >= 0, '!page && pageStartIndxLocal >= 0')
      assert(localIndex - pageStartIndxLocal >= 0 && localIndex - pageStartIndxLocal < page.pageItems.length, 'bad pageStartIndxLocal (localIndex - pageStartIndxLocal - это индекс внутри блока)')
      let pageStartIndexAbsolute = 0
      if (page.currentPageToken) {
         assert(page.currentPageToken.direction && page.currentPageToken.indx >= 0, 'bad currentPageToken')
         if (page.currentPageToken.direction === 'FORWARD') {
            pageStartIndexAbsolute = page.currentPageToken.indx
         } else if (page.currentPageToken.direction === 'BACKWARD') {
            // page.currentPageToken.indx - это последний индекс в блоке
            pageStartIndexAbsolute = page.currentPageToken.indx - (page.pageItems.length - 1)
         }
      }
      assert(pageStartIndexAbsolute >= 0)
      let absoluteIndex = pageStartIndexAbsolute + (localIndex - pageStartIndxLocal)
      assert(absoluteIndex >= 0, 'bad absoluteIndex')
   }

   // обрежет список сферху и начнет с этого элемента
   async gotoCurrent () {
      const f = this.gotoCurrent
      logD(f, 'start')
      let count
      if (this.populateFunc) count = GROUP_BATCH_SZ // дорогая операция
      else count = this.loadedLen() // выдаем все элементы разом
      let currentId = this.getProperty('currentId')
      if (currentId) {
         let indxFrom = this.findIndx(currentId)
         if (indxFrom >= 0) {
            let fulfillTo = Math.min(indxFrom + count, this.loadedLen()) // до куда грузить (end + 1)
            let nextItems = this.loadedItems().slice(indxFrom, fulfillTo)
            await this.fulfill(nextItems, 'whole')
            let firstItem = this.reactiveGroup.items[0]
            if (firstItem && this.reactiveGroup.itemType === 'GROUP') {
               firstItem.setProperty('currentId', currentId)
               await firstItem.gotoCurrent()
            }
         }
      } else {
         let nextItems = this.loadedItems().slice(0, count)
         await this.fulfill(nextItems, 'whole')
      }
   }

   async gotoStart () {
      this.setProperty('currentId', null)
      await this.gotoCurrent()
   }

   async gotoEnd () {
      // TODO!!!
      logE('not impl!!!')
   }

   hasNext () {
      let { startFullFil, endFullFil } = this.fulFilledRange()
      return endFullFil < this.loadedLen() - 1 || this.reactiveGroup.pages.length === 0 || this.reactiveGroup.pages[this.reactiveGroup.pages.length - 1].nextPageToken
   }

   hasPrev () {
      let { startFullFil, endFullFil } = this.fulFilledRange()
      return startFullFil > 0 || this.reactiveGroup.pages.length === 0 || this.reactiveGroup.pages[0].prevPageToken
   }

   async next (count) {
      const f = this.next
      logD(f, 'start')
      // if (!this.reactiveGroup.id.includes('WS_BOOKMARK')) {
      //    logD('asdasdasasds')
      // }
      if (this.populateFunc && count > GROUP_BATCH_SZ) {
         logW(f, 'next allow only 12 with populate')
         // assert(count <= 12, 'count <= 12! value =' + count)
         count = GROUP_BATCH_SZ // сервер работает пачками по 16 (12 + побочные запросы)
      }
      if (!count && this.reactiveGroup.items.length === 0) { // autoNext
         if (this.populateFunc) count = GROUP_BATCH_SZ // дорогая операция
         else count = this.loadedLen() // выдаем все элементы разом
      }
      count = count || GROUP_BATCH_SZ
      let { startFullFil, endFullFil } = this.fulFilledRange()
      if (this.paginateFunc && endFullFil !== -1 && endFullFil + count >= this.loadedLen()) {
         // запросим данные с сервера
         let pageToken = this.reactiveGroup.pages.length ? this.reactiveGroup.pages[this.reactiveGroup.pages.length - 1].nextPageToken : null
         // todo при указанных fromId и fromT - при необходимости сгенерировать токен (например когда переехали в конец контента)
         if (pageToken) {
            let rxDocPagination = await this.paginateFunc(pageToken, count * 2)
            await this.upsertPaginationPage(rxDocPagination, 'bottom')
            let range = this.fulFilledRange() // новые значения для fulfilled области
            startFullFil = range.startFullFil
            endFullFil = range.endFullFil
         }
      }
      if (endFullFil >= this.loadedLen()) return false // дошли до конца списка
      let fulfillFrom = endFullFil + 1 // начиная с какого индекса грузить
      // let fromId
      // if (!fromId && !this.reactiveGroup.items.length) { // первая загрузка - будем грузить от currentIdItem (если она указана)
      //    fromId = this.getProperty('currentId')
      // }
      // if (fromId) {
      //    let indxFrom = this.loadedItems().findIndex(item => item.oid === this.getProperty('currentId') || item.id === this.getProperty('currentId'))
      //    if (indxFrom >= 0) fulfillFrom = indxFrom
      // }
      let fulfillTo = Math.min(fulfillFrom + count, this.loadedLen()) // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)
      await this.fulfill(nextItems, 'bottom')
   }

   async prev (count) {
      const f = this.prev
      // return
      // // eslint-disable-next-line no-unreachable
      logD(f, 'start')
      if (this.populateFunc && count > GROUP_BATCH_SZ) {
         logW('next allow only 12 with populate')
         count = GROUP_BATCH_SZ // сервер работает пачками по 16 (12 + побочные запросы)
      }
      if (!count && this.reactiveGroup.items.length === 0) { // autoNext
         if (this.populateFunc) count = GROUP_BATCH_SZ // дорогая операция
         else count = this.loadedLen() // выдаем все элементы разом
      }
      count = count || GROUP_BATCH_SZ
      let { startFullFil, endFullFil } = this.fulFilledRange()
      if (this.paginateFunc && startFullFil !== -1 && count > startFullFil) {
         // запросим данные с сервера (вверх)
         if (this.reactiveGroup.pages.length && this.reactiveGroup.pages[0].prevPageToken) {
            let rxDocPagination = await this.paginateFunc(this.reactiveGroup.pages[0].prevPageToken, count * 2)
            await this.upsertPaginationPage(rxDocPagination, 'top')
            let range = this.fulFilledRange() // новые значения для fulfilled области
            startFullFil = range.startFullFil
            endFullFil = range.endFullFil
         }
      }
      if (startFullFil === 0) return false // дошли до начала списка
      let fulfillFrom = Math.max(startFullFil - count, 0) // начиная с какого индекса грузить
      let fulfillTo = startFullFil === -1 ? GROUP_BATCH_SZ : startFullFil // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)

      await this.fulfill(nextItems, 'top')
   }

   setProperty (name, value) {
      let groupData = this.propsReactive[this.reactiveGroup.id] || {}
      groupData[name] = value
      Vue.set(this.propsReactive, this.reactiveGroup.id, groupData)
      if (name === 'currentId') {
         let localIndx = this.findIndx(value) // индекс элемента в текущих страницах
         this.setProperty('currentAbsoluteIndx', this.getAbsoluteIndex(localIndx)) // индекс с учетом серверной пагинации
         this.setProperty('currentTotalCount', this.reactiveGroup.totalCount)
         if (localIndx >= 0) {
            let { page, pageStartIndxLocal } = this.findPage(localIndx)
            assert(page)
            this.setProperty('currentPageToken', page.currentPageToken)
            this.setProperty('currentPageSize', page.currentPageSize)
         } else {
            this.setProperty('currentPageToken', null)
            this.setProperty('currentPageSize', null)
         }
      }
   }

   getProperty (name) {
      let groupData = this.propsReactive[this.reactiveGroup.id]
      return groupData ? groupData[name] : null
   }
}

class ReactiveListWithPaginationFactory {
   async create (rxQueryOrRxDoc, listId = null, populateFunc = null, paginateFunc = null, propsReactive = {}) {
      rxQueryOrRxDoc.reactiveListHolderMaster = rxQueryOrRxDoc.reactiveListHolderMaster || {}
      assert(isRxQuery(rxQueryOrRxDoc) || isRxDocument(rxQueryOrRxDoc), '!isRxQuery(rxQuery)')
      if (!listId) listId = isRxDocument(rxQueryOrRxDoc) ? rxQueryOrRxDoc.id : JSON.stringify(rxQueryOrRxDoc.mangoQuery)
      assert(listId, '!listId')
      // на один rxQueryOrRxDoc может быть создано несколько  reactiveGroup (в зависимости от populateFunc)
      if (rxQueryOrRxDoc.reactiveListHolderMaster[listId]) {
      } else {
         this.mutex = new MutexLocal('ReactiveListHolder::create')

         this.group = new Group(listId, 'root', populateFunc, paginateFunc, propsReactive)
         await this.group.upsertPaginationPage(rxQueryOrRxDoc, 'whole')
         rxQueryOrRxDoc.reactiveListHolderMaster[listId] = this
      }
      assert(rxQueryOrRxDoc.reactiveListHolderMaster[listId].group, '!this.group!')
      let group = rxQueryOrRxDoc.reactiveListHolderMaster[listId].group
      return group.reactiveGroup
   }
}

export { ReactiveDocFactory, ReactiveListWithPaginationFactory, getReactiveDoc, updateRxDocPayload }
