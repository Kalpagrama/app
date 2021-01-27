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
const BATCH_SZ = 12

class Group {
   constructor (populateFunc = null, paginateFunc = null, propsReactive = {}) {
      this.pages = [] // вся лента разбита на пагинированные блоки(страницы)
      this.fulFilledItems = [] // кусочек от this.pages
      this.totalCount = 0
      this.paginateFunc = paginateFunc
      this.populateFunc = populateFunc
      this.propsReactive = propsReactive
      assert(this.propsReactive, '!this.propsReactive')
      // todo заполнять в addPaginationPage
      this.itemType = 'ITEM' // ITEM / GROUP (внутри группы мб подгруппы)
      const BATCH_SZ = 12
   }

   setProperty (name, value) {
      Vue.set(this.propsReactive, name, value)
   }

   getProperty (name) {
      return this.propsReactive[name]
   }

   saveCurrentPos (indx, currentPage = null) {
      let currentIdItem
      if (!currentPage) {
         assert(indx >= 0 && indx < this.fulFilledItems.length, 'bad indx')
         let fullItem = this.fulFilledItems[indx]
         currentIdItem = fullItem.oid || fullItem.id
         for (let page of this.pages) {
            if (page.listItems.find(item => item.oid === currentIdItem || item.id === currentIdItem)) {
               currentPage = page
               break
            }
         }
      }
      if (currentPage) {
         if (!currentIdItem) currentIdItem = currentPage.listItems[0].oid || currentPage.listItems[0].id
         assert(currentIdItem, '!currentIdItem')
         let { id, nextPageToken, prevPageToken, currentPageToken, listItems } = currentPage
         this.setProperty('currentPageToken', currentPageToken)
         this.setProperty('currentPageSize', listItems.length)
         this.setProperty('currentIdItem', currentIdItem)
      }
   }

   async refresh () {
      await this.fulfill(this.fulFilledItems, 'whole')
   }

   loadedLen () {
      let len = 0
      for (let page of this.pages) {
         len += page.listItems.length
      }
      return len
   }

   loadedItems () {
      let res = []
      for (let page of this.pages) res.push(...page.listItems)
      return res
   }

   // диапазон из loadedItems, загруженный в reactiveListFulFilled
   fulFilledRange () {
      let loadedList = this.loadedItems()
      // ищет начало reactiveListFulFilled в loadedList
      let findStart = () => {
         let searchIndx = 0
         let indx = -1
         while (searchIndx < this.fulFilledItems.length && indx === -1) {
            let searchId = this.fulFilledItems[searchIndx].oid || this.fulFilledItems[searchIndx].id
            indx = loadedList.findIndex(item => item.oid === searchId || item.id === searchId)
            searchIndx++ // ищем дальше
         }
         return indx
      }
      // ищет конец reactiveListFulFilled в loadedList
      let findEnd = () => {
         let searchIndx = this.fulFilledItems.length - 1
         let indx = -1
         while (searchIndx >= 0 && indx === -1) {
            let searchId = this.fulFilledItems[searchIndx].oid || this.fulFilledItems[searchIndx].id
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

   async fulfill (nextItems, position) {
      assert(position.in('top', 'bottom', 'whole'), 'bad position')
      // let isGroupedList = (items) => items.length && items[0].items
      let startPos = position === 'bottom' ? this.fulFilledItems.length : 0
      let deleteCount = position === 'whole' ? this.fulFilledItems.length : 0
      assert(startPos >= 0 && nextItems && Array.isArray(nextItems), 'bad fulfill params')
      if (this.itemType === 'GROUP') {
         let makeNextGroup = async (nextGroup) => {
            let {
               items,
               totalCount,
               nextPageToken,
               prevPageToken,
               currentPageToken,
               figuresAbsolute,
               thumbUrl
            } = nextGroup
            assert(items && totalCount >= 0, '!nextItem.items')
            assert(nextGroup.totalCount >= 0, '!nextItem.totalCount')
            let group = new Group(this.populateFunc)
            await group.addPaginationPage(items, 'bottom')
            await group.next(3) // сразу грузим по 3 ядра в группе
            return {
               figuresAbsolute,
               thumbUrl,
               items: group.fulFilledItems,
               totalCount: group.totalCount,
               next: group.next.bind(group),
               prev: group.prev.bind(group),
               hasNext: group.hasNext.bind(group),
               hasPrev: group.hasPrev.bind(group),
               saveCurrentPos: group.saveCurrentPos.bind(group),
               refresh: group.refresh.bind(group)
            }
         }
         nextItems = await Promise.all(nextItems.map(nextGroup => makeNextGroup(nextGroup)))
      } else {
         if (this.populateFunc) { // запрашиваем полные сущности
            nextItems = await this.populateFunc(nextItems, [], this.fulFilledItems)
         }
      }

      let blackLists = await Lists.getBlackLists()
      let filtered = nextItems.filter(obj => !Lists.isElementBlacklisted(obj, blackLists))
      this.fulFilledItems.splice(startPos, deleteCount, ...filtered)
   }

   async next (count, { fromId = null, fromT = null } = {}) {
      const f = this.next
      logD(f, 'start')
      if (this.populateFunc && count > BATCH_SZ) {
         logW(f, 'next allow only 12 with populate')
         // assert(count <= 12, 'count <= 12! value =' + count)
         count = BATCH_SZ // сервер работает пачками по 16 (12 + побочные запросы)
      }
      if (!count && this.fulFilledItems.length === 0) { // autoNext
         if (this.populateFunc) count = BATCH_SZ // дорогая операция
         else count = this.loadedLen() // выдаем все элементы разом
      }
      count = count || BATCH_SZ
      let { startFullFil, endFullFil } = this.fulFilledRange()
      if (this.paginateFunc && endFullFil !== -1 && endFullFil + count >= this.loadedLen()) {
         // запросим данные с сервера
         let pageToken = this.pages.length ? this.pages[this.pages.length - 1].nextPageToken : null
         // todo при указанных fromId и fromT - при необходимости сгенерировать токен (например когда переехали в конец контента)
         if (pageToken) {
            let rxDocPagination = await this.paginateFunc(pageToken, count * 2)
            await this.addPaginationPage(rxDocPagination, 'bottom')
            let range = this.fulFilledRange() // новые значения для fulfilled области
            startFullFil = range.startFullFil
            endFullFil = range.endFullFil
         }
      }
      if (endFullFil >= this.loadedLen()) return false // дошли до конца списка
      let fulfillFrom = endFullFil + 1 // начиная с какого индекса грузить
      if (!fromId && !this.fulFilledItems.length) { // первая загрузка - будем грузить от currentIdItem (если она указана)
         fromId = this.getProperty('currentIdItem')
      }
      if (fromId) {
         let indxFrom = this.loadedItems().findIndex(item => item.oid === this.getProperty('currentIdItem') || item.id === this.getProperty('currentIdItem'))
         if (indxFrom >= 0) fulfillFrom = indxFrom
      }
      let fulfillTo = Math.min(fulfillFrom + count, this.loadedLen()) // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)

      await this.fulfill(nextItems, 'bottom')
   }

   async prev (count) {
      const f = this.prev
      logD(f, 'start')
      if (this.populateFunc && count > BATCH_SZ) {
         logW('next allow only 12 with populate')
         count = BATCH_SZ // сервер работает пачками по 16 (12 + побочные запросы)
      }
      if (!count && this.fulFilledItems.length === 0) { // autoNext
         if (this.populateFunc) count = BATCH_SZ // дорогая операция
         else count = this.loadedLen() // выдаем все элементы разом
      }
      count = count || BATCH_SZ
      let { startFullFil, endFullFil } = this.fulFilledRange()
      if (this.paginateFunc && startFullFil !== -1 && count > startFullFil) {
         // запросим данные с сервера (вверх)
         if (this.pages.length && this.pages[0].prevPageToken) {
            let rxDocPagination = await this.paginateFunc(this.pages[0].prevPageToken, count * 2)
            await this.addPaginationPage(rxDocPagination, 'top')
            let range = this.fulFilledRange() // новые значения для fulfilled области
            startFullFil = range.startFullFil
            endFullFil = range.endFullFil
         }
      }
      if (startFullFil === 0) return false // дошли до начала списка
      let fulfillFrom = Math.max(startFullFil - count, 0) // начиная с какого индекса грузить
      let fulfillTo = startFullFil === -1 ? BATCH_SZ : startFullFil // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)
      await this.fulfill(nextItems, 'top')
   }

   hasNext () {
      let { startFullFil, endFullFil } = this.fulFilledRange()
      return endFullFil < this.loadedLen() - 1 || this.pages.length === 0 || this.pages[this.pages.length - 1].nextPageToken
   }

   hasPrev () {
      let { startFullFil, endFullFil } = this.fulFilledRange()
      return startFullFil > 0 || this.pages.length === 0 || this.pages[0].prevPageToken
   }

   async addPaginationPage (rxQueryOrRxDocOrArray, position) {
      const f = this.addPaginationPage
      assert(isRxQuery(rxQueryOrRxDocOrArray) || isRxDocument(rxQueryOrRxDocOrArray) || Array.isArray(rxQueryOrRxDocOrArray), 'bad rxQueryOrRxDocOrArray')
      assert(position.in('top', 'bottom'), 'bad position')
      let rxQuery, rxDoc, array
      if (isRxQuery(rxQueryOrRxDocOrArray)) rxQuery = rxQueryOrRxDocOrArray
      else if (isRxDocument(rxQueryOrRxDocOrArray)) rxDoc = rxQueryOrRxDocOrArray
      else if (Array.isArray(rxQueryOrRxDocOrArray)) array = rxQueryOrRxDocOrArray
      else throw new Error('bad rxQueryOrRxDocOrArray')
      assert(rxQuery || rxDoc || array, '!this.rxQuery || this.rxDoc')
      let listItems = []
      if (rxQuery) { // мастерская (элементы в списке [WS_ITEM])
         assert(rxQuery.collection.name === 'ws_items', '!this.rxQuery.collection.name === ws_items')
         let rxDocs = await rxQuery.exec()
         assert(rxDocs && Array.isArray(rxDocs), '!rxDoc && Array.isArray(rxDoc)')
         listItems = rxDocs.map(rxDoc => getReactiveDoc(rxDoc))
         this.totalCount = listItems.length
         this.groupId = JSON.stringify(rxQuery.mangoQuery) // todo для дебага
         logW('groupId=', this.groupId)
      } else if (rxDoc) { // лента полученная с сервера {items, count, totalCount}
         let {
            items,
            count,
            totalCount,
            nextPageToken,
            prevPageToken,
            currentPageToken
         } = rxDoc.toJSON().cached.data
         listItems = items
         this.totalCount = totalCount
         assert(rxDoc.props.mangoQuery, '!mangoQuery')
         assert(rxDoc.props.mangoQuery.selector.rxCollectionEnum, '!rxCollectionEnum')
         // на тот случай, что события о создании объекта пришли раньше того, как объект был помещен в ленты
         if (rxDoc.props.mangoQuery.selector.rxCollectionEnum === RxCollectionEnum.LST_SPHERE_ITEMS) {
            assert(rxDoc.props.mangoQuery.selector.oidSphere, '!oidSphere')
            for (let { type, relatedSphereOids, oidObject } of await Lists.getObjectsWithRelatedSpheres()) {
               assert(oidObject && relatedSphereOids && type.in('OBJECT_DELETED', 'OBJECT_CREATED'), '!getObjectsWithRelatedSpheres')
               if (relatedSphereOids.includes(rxDoc.props.mangoQuery.selector.oidSphere)) { // созданный / удаленный объект на этой сфере
                  let indx = listItems.findIndex(el => el.oid === oidObject)
                  if (indx === -1 && type === 'OBJECT_CREATED') {
                     listItems.push({ oid: oidObject }) // если нет такого - создадим
                  } else if (indx >= 0 && type === 'OBJECT_DELETED') {
                     listItems.splice(indx, 1) // удалим
                  }
               }
            }
         }
         this.groupId = rxDoc.id // todo для дебага
      } else if (array) {
         listItems = array
         this.totalCount = listItems.length
         this.groupId = 'custom array'
      } else throw new Error('bad rxQueryOrRxDocOrArray')
      assert(listItems && Array.isArray(listItems), 'Array.isArray(listItems)')
      let page = {
         listItems,
         id: rxDoc ? rxDoc.id : null,
         nextPageToken: rxDoc ? rxDoc.cached.data.nextPageToken : null,
         prevPageToken: rxDoc ? rxDoc.cached.data.prevPageToken : null,
         currentPageToken: rxDoc ? rxDoc.cached.data.currentPageToken : null
      }
      if (position === 'top') {
         this.pages.unshift(page)
      } else {
         this.pages.push(page)
      }
      if (listItems.length) {
         if (listItems[0].items) this.itemType = 'GROUP'
         else this.itemType = 'ITEM'
      }
      this.rxQuerySubscribe(rxQueryOrRxDocOrArray)
      // чтобы в след раз загрузилось с этого места
      // this.saveCurrentPos(null, page)
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
               let listItems = this.loadedItems()
               for (let i = 0; i < results.length; i++) {
                  if (results[i].id !== listItems[i].id) {
                     arrayChanged = true
                     break
                  }
               }
               if (!arrayChanged) return // если список не изменился - просто выходим
            }
            // logD(f, 'rxQuery changed 2', results)
            let listItemsNew = results.map(rxDoc => getReactiveDoc(rxDoc).getPayload())

            let page = this.pages[0] // в случае с rxquery - у нас только одна страница
            assert(page, '!page')
            page.listItems = listItemsNew // изменились итемы страницы
            this.totalCount = listItemsNew.length

            let { startFullFil, endFullFil } = this.fulFilledRange()
            if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
               startFullFil = 0
               endFullFil = 11
            }
            let nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
            await this.fulfill(nextItems, 'whole')
         })
      } else if (rxDoc) {
         // в список быди добавлены элементы(например при подписке)
         let rxSubscription = rxDoc.$.pipe(skip(1)).subscribe(async change => {
            logD(f, 'List::rxDoc changed. try to change this.listItems')
            assert(change.cached.data.items && Array.isArray(change.cached.data.items), '!change.items && Array.isArray(change.items)')
            let page = this.pages.find(pg => pg.id === change.id)
            assert(page, '!page')
            page.listItems = change.cached.data.items // изменились итемы страницы

            let { startFullFil, endFullFil } = this.fulFilledRange()
            if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
               startFullFil = 0
               endFullFil = 11
            }
            let nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
            await this.fulfill(nextItems, 'whole')
         })
      } else if (array) {
         // todo
         logE(f, 'TDOD  subscribe to array changes!!!!')
      } else throw new Error('!this.rxQuery && !this.rxDoc')
   }
}

class ReactiveListWithPaginationFactory {
   async create (rxQueryOrRxDoc, populateFunc = null, paginateFunc = null, propsReactive = {}) {
      assert(isRxQuery(rxQueryOrRxDoc) || isRxDocument(rxQueryOrRxDoc), '!isRxQuery(rxQuery)')
      if (rxQueryOrRxDoc.reactiveListHolderMaster) {
      } else {
         this.mutex = new MutexLocal('ReactiveListHolder::create')
         this.group = new Group(populateFunc, paginateFunc, propsReactive)
         await this.group.addPaginationPage(rxQueryOrRxDoc, 'top')
         rxQueryOrRxDoc.reactiveListHolderMaster = this
      }
      assert(rxQueryOrRxDoc.reactiveListHolderMaster.group, '!this.group!')
      let group = rxQueryOrRxDoc.reactiveListHolderMaster.group
      return {
         items: group.fulFilledItems,
         totalCount: group.totalCount,
         next: group.next.bind(group),
         prev: group.prev.bind(group),
         hasNext: group.hasNext.bind(group),
         hasPrev: group.hasPrev.bind(group),
         saveCurrentPos: group.saveCurrentPos.bind(group),
         refresh: group.refresh.bind(group)
      }
   }
}

export { ReactiveDocFactory, ReactiveListWithPaginationFactory, getReactiveDoc, updateRxDocPayload }
