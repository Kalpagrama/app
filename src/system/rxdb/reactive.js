import { assert, wait } from 'src/system/common/utils'
import { isRxDocument, isRxQuery } from 'rxdb'

import { skip } from 'rxjs/operators'
import { getRawIdFromId, RxCollectionEnum, rxdb } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import lodashGet from 'lodash/get'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { Lists } from 'src/system/rxdb/lists'
import { store } from 'src/store/index'
import cloneDeep from 'lodash/cloneDeep'

import { reactive, watch } from 'vue'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB_REACTIVE)

function getReactive (rxDocOrObject) {
   let reactiveDocFactory = isRxDocument(rxDocOrObject) ? new ReactiveDocFactory(rxDocOrObject) : new ReactiveObjFactory(rxDocOrObject)
   return reactiveDocFactory.getReactive()
}

// все изменения rxDoc - только через эту ф-ю!!! Иначе - возможны гонки (из-за debounce)
// либо - менять непосредственно reactiveItem (reactiveItem.prop = ...) (либо через reactiveItem.updateExtended)
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
      let reactiveDoc = reactiveDocFactory.getReactive()
      try {
         reactiveDocFactory.setDebouncedSave(debouncedSave)
         reactiveDocFactory.setSynchro(synchro)
         let value
         if (typeof valueOrFunc === 'function') {
            let allData = JSON.parse(JSON.stringify(reactiveDoc.getPayload() || null))
            let changedData = path ? lodashGet(allData, path, null) : allData
            value = valueOrFunc(changedData)
            assert(value, '!value')
         } else value = valueOrFunc
         reactiveDoc.updatePayloadByPath(path, value)
         // logD('after updatePayloadByPath')
      } catch (err) {
         logE('err on updateRxDocPayload', cloneDeep(reactiveDoc.getPayload()))
         throw err
      } finally {
         wait(0).then(() => { // нужно чтобы setDebouncedSave сработала после эвентов reactiveSubscribe
            reactiveDocFactory.setDebouncedSave(true)
            reactiveDocFactory.setSynchro(true)
         })
      }
   }
   // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

const debounceIntervalItem = 2000 // дебаунс сохранения реактивных элементов в rxdb

class ReactiveObjFactory {
   constructor (object) {
      assert(typeof object === 'object')
      this.vm = reactive({ reactiveData: {}, revRx: 1 })
      this.getReactive = () => {
         assert(this.vm.reactiveData.doc, '!this.vm.reactiveData.doc')
         return this.vm.reactiveData.doc
      }
      this.setReactiveDoc = (plainData) => {
         assert(typeof plainData === 'object', 'typeof payload === \'object\'')
         const reactiveDoc = plainData
         // Vue.set(this.vm.reactiveData, 'doc', reactiveDoc)
         this.vm.reactiveData.doc = reactiveDoc
      }
      this.setReactiveDoc(object)
   }
}

function TMP_CHECK (rxDoc, sss) {
   if (rxDoc?.cached?.data?.oid) {
      let oid = getRawIdFromId(rxDoc.id)
      if (oid !== rxDoc?.cached?.data?.oid) {
         alert('oid=' + oid + sss)
         logE(sss + '!!!!WTF!!!!', cloneDeep(rxDoc.toJSON()))
         throw new Error('!!!!WTF!!!!' + oid + ':' + rxDoc?.cached?.data?.oid)
      }
   }
}

// класс-обертка над rxDoc для реактивности
class ReactiveDocFactory {
   constructor (rxDoc) {
      assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
      assert(rxDoc.id, '!rxDoc.id')
      // TMP_CHECK(rxDoc, '1')
      // logD('ReactiveDocFactory::constructor', rxDoc.id)
      if (rxDoc.wsItemType) this.itemType = 'wsItem'
      else if (rxDoc.cached) this.itemType = 'object'
      else if (rxDoc.meta_data) this.itemType = 'meta'
      else throw new Error('bad itemType')
      if (rxDoc.reactiveItemHolderMaster) {
         this.getReactive = rxDoc.reactiveItemHolderMaster.getReactive
         this.getDebouncedSave = rxDoc.reactiveItemHolderMaster.getDebouncedSave
         this.setDebouncedSave = rxDoc.reactiveItemHolderMaster.setDebouncedSave
         this.getSynchro = rxDoc.reactiveItemHolderMaster.getSynchro
         this.setSynchro = rxDoc.reactiveItemHolderMaster.setSynchro
      } else {
         this.rxDoc = rxDoc
         this.mutex = new MutexLocal('ReactiveDocFactory::constructor')
         this.vm = reactive({ reactiveData: {}, revRx: rxDoc._rev })
         this.debouncedSave = true
         this.synchro = true
         this.getReactive = () => {
            assert(this.vm.reactiveData.doc, '!this.vm.reactiveData.doc')
            return this.vm.reactiveData.doc
         }
         this.setReactiveDoc = (plainData) => {
            assert(plainData && typeof plainData === 'object', '!typeof plainData === object') // сейчас plainData - всегда объект (даже для META)
            this.vm.reactiveData.doc = plainData
            const reactiveDoc = this.vm.reactiveData.doc
            reactiveDoc.getPayload = () => {
               switch (this.itemType) {
                  case 'wsItem':
                     return reactiveDoc // wsSchemaItem
                  case 'object':
                     reactiveDoc.cached.data.hasChanges = reactiveDoc.cached.data.hasChanges || false
                     return reactiveDoc.cached.data // cacheSchema
                  case 'meta':
                     return reactiveDoc.meta_data.value // schemaKeyValue
                  default:
                     throw new Error('bad itemType: ' + this.itemType)
               }
            }
            const payload = reactiveDoc.getPayload()
            reactiveDoc.updatePayloadByPath = (payloadPath, value) => {
               if (this.rxDoc.deleted) {
                  logE('rxDoc deleted!', payload)
                  // return
               }
               let fullPath
               switch (this.itemType) {
                  case 'wsItem':
                     fullPath = payloadPath || '.'
                     break
                  case 'object':
                     fullPath = `cached.data${payloadPath ? '.' + payloadPath : ''}`
                     break
                  case 'meta':
                     fullPath = `meta_data.value${payloadPath ? '.' + payloadPath : ''}`
                     break
                  default:
                     throw new Error('bad itemType: ' + this.itemType)
               }
               // ws: subscriber.name
               let propPathParent = fullPath.split('.').slice(0, -1).join('.')
               let changedPropName = fullPath.split('.').slice(-1).join('.')
               let valueParent = propPathParent ? lodashGet(reactiveDoc, propPathParent) : reactiveDoc // родитель измененного свойства
               if (valueParent) {
                  ReactiveDocFactory.mergeReactive(valueParent, changedPropName ? { [changedPropName]: value } : value)
               } else logE(`cant find prop ${fullPath} in object`, reactiveDoc)
            }

            // снабжаем объект дополнительными методами
            if (typeof payload === 'object') {
               payload.updateExtended = async (path, valueOrFunc, debouncedSave = true, synchro = true) => {
                  await updateRxDocPayload(this.rxDoc, path, valueOrFunc, debouncedSave, synchro)
               }
               payload.setChanged = (res = true) => {
                  payload.hasChanges = res
                  payload.flushDebounce()
               }
               payload.flushDebounce = () => {
                  wait(0).then(() => { // для того чтобы reactiveSubscribe успел сработать до нас
                     if (this.debouncedItemSaveFunc) this.debouncedItemSaveFunc.flush()
                  })
               }
               if (payload.wsItemType) {
                  payload.remove = async (permanent = false) => {
                     if (this.rxDoc.deleted) {
                        logW('already deleted!', payload)
                        return
                     }
                     if (payload.beforeRemove) await payload.beforeRemove(permanent)
                     if (permanent) {
                        // logW('remove permanent')
                        await this.rxDoc.remove() // удаляем навсегда (отловим в ws_items.postRemove и отправим на сервер)
                     } else {
                        // нельзя вызывать совместно с this.rxDoc.remove() тк remove всегда обгонит обновление rxDoc (из-за подписок)
                        await updateRxDocPayload(this.rxDoc, 'deletedAt', Date.now(), false) // чтобы списки реактивно обновились
                     }
                     logD('complete')
                  }
                  payload.restoreFromTrash = async () => {
                     await updateRxDocPayload(this.rxDoc, 'deletedAt', 0, false)
                  }
                  rxdb.workspace.populateReactiveWsItem(payload)
               }
            }
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
            return this.vm.revRx
         }
         this.setRev = (revRx) => {
            assert(revRx, '!_rev')
            this.vm.revRx = revRx
         }
         this.setReactiveDoc(cloneDeep(rxDoc.toJSON())) // rxDoc.toJSON() - иммутабелен
         this.rxDocSubscribe()
         this.reactiveSubscribe()
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
      if (!ignoreNull || value !== null) state[propName] = value // Vue.set(state, propName, value);
   }

   rxDocSubscribe () {
      const f = this.rxDocSubscribe
      // logD(f, `rxDoc subscribe ${this.rxDoc.id}`)
      if (this.rxDocSubscription) return
      // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
      this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async changePlainDoc => {
         try {
            logD(f, 'reactiveDoc changed start', changePlainDoc)
            await this.mutex.lock('rxDocSubscribe') // обязательно сначала блокируем !!! (см reactiveSubscribe)
            assert(this.getRev() && changePlainDoc._rev, '!this.getRev() && changePlainDoc._rev')
            if (this.getRev() === changePlainDoc._rev) return // изменения уже применены к reactiveDoc (см this.reactiveSubscribe())
            this.reactiveUnsubscribe()
            ReactiveDocFactory.mergeReactive(this.getReactive(), cloneDeep(changePlainDoc))
            this.setRev(changePlainDoc._rev)
            // logD(f, 'reactiveDoc changed stop')
         } finally {
            this.reactiveSubscribe()
            this.mutex.release()
         }
      })
   }

   rxDocUnsubscribe () {
      const f = this.rxDocUnsubscribe
      // logD(f, `rxDoc unsubscribe ${this.rxDoc.id}`)
      if (this.rxDocSubscription) this.rxDocSubscription.unsubscribe()
      delete this.rxDocSubscription
   }

   reactiveSubscribe () {
      const f = this.reactiveSubscribe
      if (this.itemType === 'meta') return // Todo в принципе можно и для meta (сейчас отключено тк везде старый код принудительно вызывает rxdb.set(RxCollectionEnum.META, ...))
      if (this.itemUnsubscribeFunc) return
      // !!! нельзя ставить flush: 'sync' - жуткие тормоза при обновлении массивов
      this.itemUnsubscribeFunc = watch(() => this.vm.reactiveData, async (newVal, oldVal) => {
         // reactiveItem изменилась (обычно из UI)
         if (!this.debouncedItemSaveFunc) {
            // itemSaveFunc - сохраняет текущий reactiveItem в rxdb
            this.itemSaveFunc = async (synchro = true) => {
               // игнорируем newVal (берем из this.reactiveItem)!!! this.reactiveItem содержит самые актуальные данные!
               const f = this.itemSaveFunc
               if (this.rxDoc.deleted) return // из-за дебаунса такое возможно
               try {
                  await this.mutex.lock('reactiveSubscribe') // обязательно сначала блокируем !!! (см rxDocSubscribe)
                  // this.rxDocUnsubscribe() !!!! --- не отписываемся от изменения тк может быть более одного документа rxDoc ( и на каждый - свой reactiveItem!) работает this._rev
                  logD(f, `try to change rxDoc ${this.rxDoc.id} ${this._rev} ${this.rxDoc._rev}`)
                  let updatedRxDoc = await this.rxDoc.atomicUpdate((oldData) => {
                     let newData = JSON.parse(JSON.stringify(this.getReactive())) // убираем реактивную хрень
                     newData._rev = oldData._rev // ревизия от rxdb (иначе - ошибки)
                     if (synchro && this.itemType === 'wsItem') newData.hasChanges = true // итем изменился локально. надо отправить изменеия на сервер
                     return newData
                  })
                  // TMP_CHECK(updatedRxDoc, '2')
                  this.setRev(updatedRxDoc._rev)
                  // logD(f, `rxDoc changed ${updatedRxDoc.id} ${updatedRxDoc._rev}`)
               } catch (err) {
                  logE('err on reactiveSubscribe', cloneDeep(this.getReactive()))
                  throw err
               } finally {
                  // this.rxDocSubscribe()
                  this.mutex.release()
               }
            }
            this.debouncedItemSaveFunc = debounce(this.itemSaveFunc, debounceIntervalItem, { maxWait: 8888 })
         }

         if (this.getDebouncedSave()) {
            // logD(f, 'reactiveItem changed (rxDoc will change via debounce later)')
            this.debouncedItemSaveFunc(this.getSynchro())
         } else {
            // logD(f, 'reactiveItem changed without debounce NOW')
            await this.itemSaveFunc(this.getSynchro())
         }
      }, { deep: true, immediate: false, flush: 'pre' })
   }

   reactiveUnsubscribe () {
      const f = this.reactiveUnsubscribe
      if (this.itemUnsubscribeFunc) this.itemUnsubscribeFunc()
      delete this.itemUnsubscribeFunc
   }
}

// группа (может содержать элементы либо другие группы)
export const GROUP_BATCH_SZ = 11 // сервер работает пачками по 55 (11 джойнтов - это 55 объектов(в джоинте 2 ядра и в каждом - 1 композиция))

class Group {
   constructor (id, name, populateFunc = null, paginateFunc = null, propsReactive = {}, screenSize = 0) {
      assert(id && typeof id === 'string')
      this.debugUniqueOids = new Set() // TODO костыль (бэкенд дублирует элементы) PS. А может и не костыль... можно оставить на всякий случай тк  vue глючит когда в списке 2 одинаковых ключа
      // события об обновлении могут дублироваться (например, создание объекта сначала упреждающе записывает в rxdb, а потом по подписке)
      this.mutexSubscribe = new MutexLocal('Group::rxQueryOrDocSubscribe')
      this.paginateFunc = paginateFunc
      this.populateFunc = populateFunc
      this.propsReactive = propsReactive
      this.screenSize = screenSize // максимальная длина ленты (при превышении - обрезается снизу или сверху)
      assert(this.propsReactive, '!this.propsReactive')
      this.vm = reactive({
         reactiveGroup: {
            id,
            name,
            pages: [], // вся лента разбита на пагинированные блоки(страницы)
            items: [], // кусочек от this.pages (для каждого item вызывается populate). это отдается в UI. далее пополняется через next/prev
            itemsHeaderFooter: [], // items + header + footer ( сверху и снизу списка добавляется по служебной строке (для того чтобы при отображении списков добавлять туда кнопки и спиннеры))
            itemPrimaryKey: null, // имя поля в item (обычно либо 'oid' либо 'id')
            totalCount: 0,
            itemType: 'ITEM', // ITEM / GROUP (внутри группы мб подгруппы)
            goto: this.goto.bind(this),
            gotoCurrent: this.gotoCurrent.bind(this),
            gotoStart: this.gotoStart.bind(this),
            gotoEnd: this.gotoEnd.bind(this),
            // next: this.next.bind(this),
            // prev: this.prev.bind(this),
            next: debounce(this.next.bind(this), 1000, { leading: true, maxWait: 8888 }),
            next_: this.next.bind(this),
            prev: debounce(this.prev.bind(this), 1000, { leading: true, maxWait: 8888 }),
            gotoPercent: debounce(this.gotoPercent.bind(this), 1000, { leading: true, maxWait: 8888 }),
            hasNext: false,
            hasPrev: false,
            loadedLen: 0,
            fulFilledRange: { startFullFil: -1, endFullFil: -1 },
            newItemsBelow: 0, // в списке появились новые элементы выше
            newItemsAbove: 0, // в списке появились новые элементы ниже
            setProperty: this.setProperty.bind(this),
            getProperty: this.getProperty.bind(this),
            refresh: this.refresh.bind(this)
         }
      })
      this.reactiveGroup = this.vm.reactiveGroup
      this.updateReactiveGroup = () => {
         this.reactiveGroup.hasNext = this.hasNext()
         this.reactiveGroup.hasPrev = this.hasPrev()
         this.reactiveGroup.loadedLen = this.loadedLen()
         this.reactiveGroup.fulFilledRange = this.fulFilledRange()

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
      }
   }

   static async getGroupPropertiesQuery (rxQuery) {
      assert(rxQuery && isRxQuery(rxQuery), '!rxQuery')
      let totalCount, itemType, itemPrimaryKey // данные списка
      let pageId, pageItems, nextPageToken, prevPageToken, currentPageToken // данные текущей страницы
      assert(rxQuery.collection.name === 'ws_items', '!this.rxQuery.collection.name === ws_items')
      let mangoQuery = rxQuery.mangoQuery
      assert(mangoQuery, '!mangoQuery')
      let rxDocs = await rxQuery.exec()
      assert(rxDocs && Array.isArray(rxDocs), '!rxDoc && Array.isArray(rxDoc)')
      // не включаем pagination.pageSize (могут быть 2 страницы с разными pageSize)!
      pageId = JSON.stringify(mangoQuery.selector) + '::pageToken=' + (mangoQuery.pagination ? JSON.stringify(mangoQuery.pagination.pageToken) : 'empty')
      pageItems = rxDocs.map(rxDoc => getReactive(rxDoc))
      totalCount = pageItems.length
      itemType = mangoQuery.selector.groupByContentLocation ? 'GROUP' : 'ITEM'
      itemPrimaryKey = 'id'
      return { pageId, pageItems, totalCount, itemType, itemPrimaryKey, nextPageToken, prevPageToken, currentPageToken }
   }

   static getGroupPropertiesRxDoc (rxDoc) {
      assert(rxDoc && isRxDocument(rxDoc), '!rxDoc')
      let totalCount, itemType, itemPrimaryKey // данные списка
      let pageId, pageItems, nextPageToken, prevPageToken, currentPageToken // данные текущей страницы
      let {
         items,
         totalCount: totalCount_,
         nextPageToken: nextPageToken_,
         prevPageToken: prevPageToken_,
         currentPageToken: currentPageToken_
      } = cloneDeep(rxDoc.toJSON().cached.data)
      let mangoQuery = rxDoc.props.mangoQuery
      assert(mangoQuery, '!mangoQuery')
      assert(mangoQuery.selector.rxCollectionEnum, '!rxCollectionEnum')
      // не включаем pagination.pageSize (могут быть 2 страницы с разными pageSize)!
      pageId = JSON.stringify(mangoQuery.selector) + '::pageToken=' + (mangoQuery.pagination ? JSON.stringify(mangoQuery.pagination.pageToken) : 'empty')
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
            case RxCollectionEnum.LST_FEED: // эвенты
            case RxCollectionEnum.LST_COMMENTS: // комменты
               itemPrimaryKey = 'id'
               break
            case RxCollectionEnum.LST_CONTENT_CUTS:
               itemPrimaryKey = 'cutId'
               break
            default:
               throw new Error('bad rxDoc.props.mangoQuery.selector.rxCollectionEnum: ' + mangoQuery.selector.rxCollectionEnum)
         }
      }
      return { pageId, pageItems, totalCount, itemType, itemPrimaryKey, nextPageToken, prevPageToken, currentPageToken }
   }

   static getGroupPropertiesArray (array) {
      assert(array && Array.isArray(array), '!array')
      let totalCount, itemType, itemPrimaryKey // данные списка
      let pageId, pageItems, nextPageToken, prevPageToken, currentPageToken // данные текущей страницы
      pageId = 'custom array'
      pageItems = array
      totalCount = pageItems.length
      itemType = 'ITEM' // todo определять тип итемов внутри (возможно позже там могут быть и группы)
      const detectArrItemPrimaryKey = (items) => {
         assert(items, 'detectArrItemPrimaryKey::!items')
         if (pageItems.length) {
            if (pageItems[0].oid) return 'oid'
            else if (pageItems[0].id) return 'id'
         } else return 'unknown'
      }
      itemPrimaryKey = detectArrItemPrimaryKey(pageItems)
      return { pageId, pageItems, totalCount, itemType, itemPrimaryKey, nextPageToken, prevPageToken, currentPageToken }
   }

   static async getGroupProperties (rxQueryOrRxDocOrArray) {
      let rxQuery, rxDoc, array
      if (isRxQuery(rxQueryOrRxDocOrArray)) rxQuery = rxQueryOrRxDocOrArray
      else if (isRxDocument(rxQueryOrRxDocOrArray)) rxDoc = rxQueryOrRxDocOrArray
      else if (Array.isArray(rxQueryOrRxDocOrArray)) array = rxQueryOrRxDocOrArray
      else throw new Error('bad rxQueryOrRxDocOrArray')
      assert(rxQuery || rxDoc || array, '!this.rxQuery || this.rxDoc')
      let totalCount, itemType, itemPrimaryKey // данные списка
      let pageId, pageItems, nextPageToken, prevPageToken, currentPageToken // данные текущей страницы
      if (rxQuery) { // мастерская (элементы в списке [WS_ITEM])
         return await Group.getGroupPropertiesQuery(rxQuery)
      } else if (rxDoc) { // лента полученная с сервера {items, count, totalCount}
         return Group.getGroupPropertiesRxDoc(rxDoc)
      } else if (array) {
         return Group.getGroupPropertiesArray(array)
      } else throw new Error('bad rxQueryOrRxDocOrArray')
   }

   // подписаться на обновления rxDoc
   rxQueryOrDocSubscribe (rxQueryOrRxDocOrArray) {
      const f = this.rxQueryOrDocSubscribe
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
            try {
               await this.mutexSubscribe.lock('rxQuery::$')
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
                  if (!arrayChanged) {
                     return
                  } // если список не изменился - просто выходим
               }
               // logD(f, 'rxQuery changed 2', results)
               let pageItemsNew = results.map(rxDoc => getReactive(rxDoc).getPayload())
               assert(this.reactiveGroup.pages.length === 1, 'this.reactiveGroup.pages.len != 1')
               let page = this.reactiveGroup.pages[0] // в случае с rxquery - у нас только одна страница
               assert(page, '!page')
               page.pageItems = pageItemsNew // изменились итемы страницы
               this.reactiveGroup.totalCount = pageItemsNew.length
               let nextItems = pageItemsNew
               if (this.populateFunc) {
                  let { startFullFil, endFullFil } = this.fulFilledRange()
                  if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
                     startFullFil = 0
                     endFullFil = 11
                  }
                  nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
               }
               await this.fulfill(nextItems, 'whole')
            } finally {
               this.mutexSubscribe.release()
            }
         })
      } else if (rxDoc) {
         // в список были добавлены элементы(например при подписке)
         let rxSubscription = rxDoc.$.pipe(skip(1)).subscribe(async (change) => {
            try {
               await this.mutexSubscribe.lock('rxDoc::$')
               logD(f, 'List::rxDoc changed. try to change this.pageItems', this.reactiveGroup.id)
               assert(change.cached.data.items && Array.isArray(change.cached.data.items), '!change.items && Array.isArray(change.items)')
               await this.upsertPaginationPage(rxDoc, 'replace', false)
               let { startFullFil, endFullFil } = this.fulFilledRange()
               if (endFullFil - startFullFil === 0) { // сдвигаемся с мертвой точки
                  endFullFil = startFullFil = 0
               }
               if (startFullFil === 1) startFullFil = 0 // workaround если добавился сверху 1 элемент
               if (endFullFil === this.loadedLen() - 2) endFullFil = this.loadedLen() - 1 // workaround если добавился снизу 1 элемент
               let nextItems = this.loadedItems().slice(startFullFil, endFullFil + 1)
               await this.fulfill(nextItems, 'whole')
               let thiz = this
               logD('thiz', thiz)
            } finally {
               this.mutexSubscribe.release()
            }
         })
      }
   }

   async upsertPaginationPage (rxQueryOrRxDocOrArray, position, subscribe = true) {
      const f = this.upsertPaginationPage
      assert(isRxQuery(rxQueryOrRxDocOrArray) || isRxDocument(rxQueryOrRxDocOrArray) || Array.isArray(rxQueryOrRxDocOrArray), 'bad rxQueryOrRxDocOrArray')
      assert(position.in('top', 'bottom', 'whole', 'replace'), 'bad position')
      let {
         totalCount,
         itemType,
         itemPrimaryKey,
         pageId,
         pageItems,
         nextPageToken,
         prevPageToken,
         currentPageToken
      } = await Group.getGroupProperties(rxQueryOrRxDocOrArray)
      assert(pageId, '!pageId')
      assert(totalCount >= 0, '!totalCount')
      assert(itemType && itemType.in('GROUP', 'ITEM'), 'bad itemType')
      assert(itemPrimaryKey, '!itemPrimaryKey')
      assert(pageItems && Array.isArray(pageItems), 'Array.isArray(pageItems)')

      { // исключаем дубликаты
         // TODO!!! убрать debugUniqueOids??? (или пусть будет???) (поправить задваивание на сервере!!!!)
         if (position === 'whole') {
            this.debugUniqueOids.clear()
         } else if (position === 'replace') {
            let pageIndx = this.reactiveGroup.pages.findIndex(pg => pg.pageId === pageId)
            if (pageIndx >= 0) {
               let page = this.reactiveGroup.pages[pageIndx]
               for (let item of page.pageItems) {
                  this.debugUniqueOids.delete(item[page.itemPrimaryKey]) // удаляем старые
               }
            }
         }
         if (this.reactiveGroup.pages.length === 0) this.debugUniqueOids.clear()// на всякий случай
         pageItems = pageItems.filter(item => {
            if (this.debugUniqueOids.has(item[itemPrimaryKey])) logE('duplicate found!!!', item[itemPrimaryKey], item, this.reactiveGroup.id)
            let res = !this.debugUniqueOids.has(item[itemPrimaryKey])
            this.debugUniqueOids.add(item[itemPrimaryKey])
            return res
         })
      }
      // обновляем данные списка в сответствии с уточненными данными
      this.reactiveGroup.totalCount = totalCount
      this.reactiveGroup.itemType = itemType
      this.reactiveGroup.itemPrimaryKey = itemPrimaryKey
      let page = {
         itemPrimaryKey,
         pageItems,
         pageId,
         nextPageToken,
         prevPageToken,
         currentPageToken,
         currentPageSize: Math.max(pageItems.length, GROUP_BATCH_SZ)
      }
      if (position === 'replace') { // обновить страницу
         let pageIndx = this.reactiveGroup.pages.findIndex(pg => pg.pageId === page.pageId)
         if (pageIndx >= 0) this.reactiveGroup.pages.splice(pageIndx, 1, page)
         else logE('page for upldate not found!!!!', page, this.reactiveGroup.pages)
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
         this.reactiveGroup.pages.splice(0, this.reactiveGroup.pages.length, page)
      } else throw new Error('bad position' + position)
      if (subscribe) this.rxQueryOrDocSubscribe(rxQueryOrRxDocOrArray)
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
      // assert(endFullFil >= startFullFil, 'logic error end < start' + startFullFil + ':' + endFullFil + '::' + this.reactiveGroup.id)
      if (endFullFil >= startFullFil) { // такое возможно, если список сильно изменился (например, он обновился после того как протух в кэше)
         return { startFullFil, endFullFil }
      } else {
         logE('logic error end < start' + startFullFil + ':' + endFullFil + '::' + this.reactiveGroup.id) // todo иногда случается... ХЗ что это...
         return { startFullFil: Math.min(startFullFil, endFullFil), endFullFil: Math.min(startFullFil, endFullFil) }
      }
   }

   // заполнить итоговый массив(отдается в UI)
   async fulfill (nextItems, position) {
      assert(position.in('top', 'bottom', 'whole'), 'bad position')
      // let isGroupedList = (items) => items.length && items[0].items
      let items = this.reactiveGroup.items
      let startPos = position === 'bottom' ? this.reactiveGroup.items.length : 0
      let deleteCount = position === 'whole' ? this.reactiveGroup.items.length : 0
      assert(startPos >= 0 && nextItems && Array.isArray(nextItems), 'bad fulfill params')
      let blackLists = await Lists.getBlackLists()
      let filtered = nextItems.filter(item => !Lists.isElementBlacklisted(item, blackLists))
      let maxInsertCount = filtered.length
      // максимум this.screenSize элементов (если больше - то отрезаем верх или низ) отрезать надо тк при большик кол-вах реактивных элементов запросы в rxDB начинают выполнятся очень долго!
      if (this.screenSize) maxInsertCount = this.screenSize / 2 + Math.max((this.screenSize / 2) - items.length, 0) // можем вставить половину от screenSize + столько, сколько не хватает в items до половины от screenSize
      if (this.populateFunc) maxInsertCount = Math.min(maxInsertCount, GROUP_BATCH_SZ) // (populateFunc - тяжелая операция. запрашиваем не более GROUP_BATCH_SZ элементов)
      if (position === 'top') {
         filtered.splice(0, Math.max(0, filtered.length - maxInsertCount)) // обрезаем сверху
      } else if (position === 'bottom' || position === 'whole') {
         filtered.splice(maxInsertCount, filtered.length) // обрезаем снизу
      }
      if (this.reactiveGroup.itemType === 'GROUP') {
         let makeNextGroup = async (nextGroup, nextSize) => {
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
            // Vue.set(this.propsReactive, '')
            let group = new Group(groupId, groupName, this.populateFunc, null, this.propsReactive, this.screenSize)
            // Vue.set(group.reactiveGroup, 'figuresAbsolute', figuresAbsolute)
            // Vue.set(group.reactiveGroup, 'thumbUrl', thumbUrl)
            // Vue.set(group.reactiveGroup, 'nextPageToken', nextPageToken)
            // Vue.set(group.reactiveGroup, 'prevPageToken', prevPageToken)
            // Vue.set(group.reactiveGroup, 'currentPageToken', currentPageToken)
            group.reactiveGroup.figuresAbsolute = figuresAbsolute
            group.reactiveGroup.thumbUrl = thumbUrl
            group.reactiveGroup.nextPageToken = nextPageToken
            group.reactiveGroup.prevPageToken = prevPageToken
            group.reactiveGroup.currentPageToken = currentPageToken

            await group.upsertPaginationPage(items, 'whole')
            await group.next(nextSize) // сразу грузим элементы в группе
            return group.reactiveGroup
         }
         filtered = await Promise.all(filtered.map(nextGroup => makeNextGroup(nextGroup, 3)))
      } else {
         if (this.populateFunc) { // запрашиваем полные сущности
            filtered = await this.populateFunc(filtered, [], this.reactiveGroup.items)
         }
      }
      for (let item of filtered) {
         // !!!  нельзя менять item (он реактивен и связан с исходником в rxdb)
         // item.debugInfo = () => {
         //    let indx = this.findIndx(item[this.reactiveGroup.itemPrimaryKey])
         //    return {
         //       indx,
         //       indxHF: indx + 1,
         //       loadedLen: this.loadedLen(),
         //       totalCount: this.reactiveGroup.totalCount,
         //       fulFilledRange: this.fulFilledRange()
         //    }
         // }
      }
      items.splice(startPos, deleteCount, ...filtered) // добавляем новые
      if (this.screenSize) {
         // максимум this.screenSize элементов (если больше - то отрезаем верх или низ)
         // отрезать надо тк при большик кол-вах реактивных элементов запросы в rxDB начинают выполнятся очень долго!
         if (position === 'top') {
            items.splice(this.screenSize, items.length) // листнули вверх. обрезаем снизу старое
         } else if (position === 'bottom') {
            items.splice(0, Math.max(0, items.length - this.screenSize)) // листнули вниз. обрезаем сверху старое
         }
      }
      this.reactiveGroup.itemsHeaderFooter = [
         { [this.reactiveGroup.itemPrimaryKey]: 'header' },
         ...items,
         { [this.reactiveGroup.itemPrimaryKey]: 'footer' }
      ]
      this.updateReactiveGroup()
      return filtered
   }

   // найдет элемент в списке (поиск идет и вглубь (не важно на каком уровне находится элемент))
   findIndx (currentId, findInDeep = true) {
      let indxFrom = -1
      let findItemIndex = (items, itemPrimaryKey, id) => {
         let indx = items.findIndex(item => item[itemPrimaryKey] === id)
         if (indx === -1 && findInDeep) { // на этом уровне currentId не найден (идем вглубь)
            for (let i = 0; i < items.length; i++) {
               let subitems = items[i].items
               if (subitems) {
                  let { itemPrimaryKey } = Group.getGroupPropertiesArray(subitems)
                  if (findItemIndex(subitems, itemPrimaryKey, id) >= 0) {
                     indx = i
                     break
                  }
               }
            }
         }
         return indx
      }
      if (currentId) indxFrom = findItemIndex(this.loadedItems(), this.reactiveGroup.itemPrimaryKey, currentId)
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

   // загрузит область от indxFrom до indxFrom + count
   async goto (indxFrom, count) {
      assert(indxFrom >= 0 && count >= 0)
      let fulfillTo = Math.min(indxFrom + count, this.loadedLen()) // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(indxFrom, fulfillTo)
      await this.fulfill(nextItems, 'whole')
   }

   // обрежет список сферху и начнет с этого элемента
   async gotoCurrent () {
      const f = this.gotoCurrent
      let currentId = this.getProperty('currentId')
      if (currentId) {
         logD(f, 'start. currentId=', currentId, this.reactiveGroup.id)
         let indxFrom = this.findIndx(currentId)
         if (indxFrom >= 0) {
            let count = this.loadedLen() // выдаем все элементы разом
            await this.goto(indxFrom, count)
            let firstItem = this.reactiveGroup.items[0]
            if (firstItem && this.reactiveGroup.itemType === 'GROUP') {
               firstItem.setProperty('currentId', currentId)
               await firstItem.gotoCurrent()
            }
            await this.goto(indxFrom, count)
         }
      }
      logD(f, 'complete', this.reactiveGroup.id)
   }

   async gotoStart () {
      if (this.paginateFunc) {
         this.reactiveGroup.pages.splice(0, this.reactiveGroup.pages.length)
         let rxDocPagination = await this.paginateFunc()
         await this.upsertPaginationPage(rxDocPagination, 'whole')
      }
      let count = this.loadedLen() // выдаем все элементы разом
      let nextItems = this.loadedItems().slice(0, count)
      await this.fulfill(nextItems, 'whole')
   }

   async gotoEnd () {
      // TODO!!!
      logE('not impl!!!')
   }

   async gotoPercent (percent) {
      const f = this.gotoPercent
      if (!this.loadedLen()) return
      assert(percent >= 0 && percent <= 1)
      let indxFrom = Math.floor(this.loadedLen() * percent)
      assert(indxFrom >= 0 && indxFrom < this.loadedLen())
      let item = this.loadedItems()[indxFrom]
      assert(item)
      this.setProperty('currentId', item[this.reactiveGroup.itemPrimaryKey])
      await this.gotoCurrent()
      this.setProperty('currentId', null)
      //
      // let count = this.loadedLen() // выдаем все элементы разом
      // let fulfillTo = Math.min(indxFrom + count, this.loadedLen()) // до куда грузить (end + 1)
      // let nextItems = this.loadedItems().slice(indxFrom, fulfillTo)
      // await this.fulfill(nextItems, 'whole')
      logD(f, 'complete', this.reactiveGroup.id)
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
      const t1 = performance.now()
      // if (this.reactiveGroup.id.includes('LST_SPHERE_ITEMS')) logW(f, 'start', count, this.screenSize)
      count = parseInt(count || this.loadedLen())
      assert(!this.screenSize || count < this.screenSize, { count, screenSize: this.screenSize }) // иначе обрежутся новые элементы
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
      let fulfillTo = Math.min(fulfillFrom + count, this.loadedLen()) // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)
      let fulfilledItems = await this.fulfill(nextItems, 'bottom')
   }

   async prev (count) {
      const f = this.prev
      // return
      // // eslint-disable-next-line no-unreachable
      logD(f, 'start', this.reactiveGroup.id)
      count = parseInt(count || this.loadedLen())
      assert(!this.screenSize || this.screenSize > count, { count, screenSize: this.screenSize }) // иначе обрежутся новые элементы
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
      let fulfillTo = startFullFil === -1 ? count : startFullFil // до куда грузить (end + 1)
      let nextItems = this.loadedItems().slice(fulfillFrom, fulfillTo)
      await this.fulfill(nextItems, 'top')
      // logD(f, `complete add from:${fulfillFrom} to:${fulfillTo} total range:`, this.reactiveGroup.id)
   }

   setProperty (name, value) {
      let groupData = this.propsReactive[this.reactiveGroup.id] || {}
      groupData[name] = value
      // Vue.set(this.propsReactive, this.reactiveGroup.id, groupData)
      this.propsReactive[this.reactiveGroup.id] = groupData
      if (name === 'currentId' && value) {
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
   async create (rxQueryOrRxDoc, listId = null, populateFunc = null, paginateFunc = null, propsReactive = {}, screenSize = 0) {
      rxQueryOrRxDoc.reactiveListHolderMaster = rxQueryOrRxDoc.reactiveListHolderMaster || {}
      assert(isRxQuery(rxQueryOrRxDoc) || isRxDocument(rxQueryOrRxDoc), '!isRxQuery(rxQuery)')
      if (!listId) listId = isRxDocument(rxQueryOrRxDoc) ? rxQueryOrRxDoc.id : JSON.stringify(rxQueryOrRxDoc.mangoQuery)
      assert(listId, '!listId')
      // на один rxQueryOrRxDoc может быть создано несколько  reactiveGroup (в зависимости от populateFunc)
      if (!rxQueryOrRxDoc.reactiveListHolderMaster[listId]) {
         this.mutex = new MutexLocal('ReactiveListHolder::create')

         this.group = new Group(listId, 'root', populateFunc, paginateFunc, propsReactive, screenSize)
         await this.group.upsertPaginationPage(rxQueryOrRxDoc, 'whole')
         rxQueryOrRxDoc.reactiveListHolderMaster[listId] = this
      }
      assert(rxQueryOrRxDoc.reactiveListHolderMaster[listId].group, '!this.group!')
      let group = rxQueryOrRxDoc.reactiveListHolderMaster[listId].group
      return group.reactiveGroup
   }

   allReactiveGroups (rxQueryOrRxDoc) {
      if (rxQueryOrRxDoc.reactiveListHolderMaster) return Object.values(rxQueryOrRxDoc.reactiveListHolderMaster).map(factory => factory.group.reactiveGroup)
      return []
   }
}

export {
   debounceIntervalItem,
   ReactiveDocFactory,
   ReactiveObjFactory,
   ReactiveListWithPaginationFactory,
   getReactive,
   updateRxDocPayload
}
