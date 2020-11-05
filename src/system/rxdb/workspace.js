import { isRxDocument } from 'rxdb'

import assert from 'assert'
import { wsSchemaItem, wsSchemaLocalChanges } from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { mutexGlobal, MutexLocal } from 'src/system/rxdb/mutex'
import { WorkspaceApi } from 'src/api/workspace'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import intersectionWith from 'lodash/intersectionWith'
import { getRxCollectionEnumFromId, RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import { wait } from 'src/system/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_WS)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_WS)

const synchroTimeDefault = 1000 * 60 * 1 // раз в 1 минут шлем изменения на сервер
// const synchroTimeDefault = 1000// раз в 1 минут шлем изменения на сервер
// logE('synchroTimeDefault!!! 1000')
class WaitBreakable {
   constructor (ms) {
      this.timeout = ms
   }

   break () {
      logD('форсированное прерывание таймера ожидания(WaitBreakable)... ')
      this.waitUntil = Date.now()
   }

   setTimeout (ms) {
      this.timeout = ms
   }

   getTimeOut () {
      return this.timeout
   }

   async wait () {
      this.waitUntil = Date.now() + this.timeout
      while (this.waitUntil > Date.now()) {
         await wait(Math.min(1000, this.timeout / 2))
      }
   }
}

const WsItemTypeEnum = Object.freeze({
   WS_ANY: 'WS_ANY', // нужно только для запросов (рельных объектов с таким типом нет)
   WS_NODE: 'WS_NODE',
   WS_CONTENT: 'WS_CONTENT',
   WS_SPHERE: 'WS_SPHERE',
   WS_BOOKMARK: 'WS_BOOKMARK',
   WS_JOINT: 'WS_JOINT',
   WS_COLLECTION: 'WS_COLLECTION'
})
const WsCollectionEnum = Object.freeze({
   ...WsItemTypeEnum,
   WS_CHANGES: 'WS_CHANGES'
})
const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

// Workspace вызывается 1: из UI(upsertItem/deleteItem); 2: из сети(processEvent); 3: synchroLoop.
// Эти ф-ии сериализованы(вызываются строго друг за другом) (см MutexLocal)
class Workspace {
   constructor (db) {
      assert(db, '!rxdb')
      this.db = db
      this.mutex = new MutexLocal('rxdb::ws')
      this.synchroLoopWaitObj = new WaitBreakable(synchroTimeDefault)
      this.reactiveUser = null
      this.synchro = false
   }

   async updateCollections (operation) {
      assert(operation.in('create', 'delete', 'recreate'))
      const f = this.updateCollections
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await this.lock('ws::updateCollections')
         if (operation.in('delete', 'recreate')) {
            if (this.db.ws_items) await this.db.ws_items.remove()
            if (this.db.ws_changes) await this.db.ws_changes.remove()
         }
         if (operation.in('create', 'delete', 'recreate')) {
            if (this.db.ws_items) await this.db.ws_items.destroy()
            if (this.db.ws_changes) await this.db.ws_changes.destroy()
         }
         if (operation.in('create', 'recreate')) {
            await this.db.collection({
               name: 'ws_items',
               schema: wsSchemaItem,
               migrationStrategies: {
                  // ..., - см wsSchemaItem.version (из schema.js)
                  1: oldDoc => {
                     if (oldDoc.wsItemType === 'WS_BOOKMARK') {
                        if (!oldDoc.feeds) oldDoc.feeds = []
                        if (!oldDoc.spheres) oldDoc.spheres = []
                        if (oldDoc.contentType) {
                           oldDoc.type = oldDoc.contentType
                           delete oldDoc.contentType
                        }
                     }
                     if (oldDoc.wsItemType === 'WS_COLLECTION') {
                        oldDoc.feeds = []
                        oldDoc.spheres = []
                     }
                     return oldDoc
                  }
                  // 2: oldDoc => oldDoc,
               }
            })
            await this.db.collection({ name: 'ws_changes', schema: wsSchemaLocalChanges })
            assert(this.db.ws_items && this.db.ws_changes, '!this.db.ws_items && this.db.ws_changes')
            // обработка события измения мастерской пользователем (запоминает измененные элементы)
            let onWsChangedByUser = async (id, operation, rev) => {
               assert(id && operation && operation in WsOperationEnum, 'bad params' + id + operation)
               await this.db.ws_changes.atomicUpsert({ id, operation, rev })
            }
            const checkUnique = async (plainData) => {
               assert(plainData.wsItemType in WsItemTypeEnum, '!plainData.wsItemType in WsItemTypeEnum')
               if (plainData.wsItemType === WsItemTypeEnum.WS_SPHERE) {
                  assert(plainData.name)
                  const found = await rxdb.find({
                     selector: {
                        rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
                        name: plainData.name
                     }
                  }, true)
                  if (found.length) throw new Error(`уже есть такая же сфера (${plainData.name})!!!!!`)
               }
            }
            this.db.ws_items.preSave(async (plainData, rxDoc) => {
               await checkUnique(plainData)
               plainData.ignoreChanges = false
               let plainDataCopy = cloneDeep(plainData) // newVal
               delete plainDataCopy._rev // внутреннее св-во rxdb (мешает при сравненении)
               let rxDocCopy = rxDoc.toJSON() // oldVal
               // rev - присваивается сервером (не реагируем на изменения rev (это происходит в processEvent))
               delete plainDataCopy.rev
               delete rxDocCopy.rev
               // logD(f, 'preSave', rxDocCopy, plainDataCopy, isEqual(plainDataCopy, rxDocCopy))
               if (isEqual(plainDataCopy, rxDocCopy)) {
                  // изменена ТОЛЬКО ревизия. На сервер ничего слать не надо (иначе будет бесконечный цикл)
                  logD(f, ' ignoreChanges', rxDocCopy, plainDataCopy)
                  plainData.ignoreChanges = true // будет проверено в this.db.ws_items.postSave
               }
            }, false)
            this.db.ws_items.preInsert(async (plainData) => {
               await checkUnique(plainData)
            }, false);
            this.db.ws_items.postSave(async (plainData, rxDoc) => {
               // сработает на всех вкладках (независимо от того, какая изменила итем) для этого - mutexGlobal.isLeader()
               // plainData.synchronized === false - если данные изменились по событию от сервера ( см processEvent)
               if (mutexGlobal.isLeader() && !plainData.synchronized) {
                  await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT, plainData.rev)
               }
            }, false)
            this.db.ws_items.postInsert(async (plainData) => {
               // сработает на всех вкладках (независимо от того, какая изменила итем) для этого - mutexGlobal.isLeader()
               // plainData.synchronized === false - если данные изменились по событию от сервера ( см processEvent)
               if (mutexGlobal.isLeader() && !plainData.synchronized) {
                  await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT, plainData.rev)
               }
            }, false)
            this.db.ws_items.postRemove(async (plainData) => {
               // сработает на всех вкладках (независимо от того, какая изменила итем) для этого - mutexGlobal.isLeader()
               // plainData.synchronized === false - если данные изменились по событию от сервера ( см processEvent)
               if (mutexGlobal.isLeader() && !plainData.synchronized) {
                  await onWsChangedByUser(plainData.id, WsOperationEnum.DELETE, plainData.rev)
               }
               rxdb.onRxDocDelete(plainData.id) // удалить из lru(иначе он будет находиться через rxdb.get())
            }, false)
         }
      } finally {
         this.release()
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async create () {
      const f = this.create
      const t1 = performance.now()
      assert(!this.created, 'this.created')
      try {
         // синхроним изменения в цикле
         this.synchroLoop = async () => {
            const f = this.synchroLoop
            f.nameExtra = 'synchroLoop'
            logD(f, 'start')
            this.synchroStarted = true // защита от двойного запуска
            while (true) {
               if (this.reactiveUser && this.synchro && rxdb.initialized && mutexGlobal.isLeader()) {
                  try {
                     await mutexGlobal.lock('ws::synchroLoop')
                     await this.lock('ws::synchroLoop')
                     const tLoop = performance.now()
                     logD(f, 'next loop start...', this.synchroLoopWaitObj.getTimeOut())
                     await this.synchronize()
                     logD(f, `next loop complete: ${Math.floor(performance.now() - tLoop)} msec`)
                  } catch (err) {
                     logE(f, 'не удалось синхронизировать мастерскую с сервером', err)
                     this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeDefault * 10))
                  } finally {
                     this.release()
                     await mutexGlobal.release('ws::synchroLoop')
                  }
               }
               await this.synchroLoopWaitObj.wait()
            }
         }
         if (!this.synchroStarted) this.synchroLoop().catch(err => logE(f, 'не удалось запустить цикл синхронизации', err))
         this.created = true
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, this.created)
      } finally {
      }
   }

   setUser (reactiveUser) { // для гостей мастерская НЕ синхронится с сервером!
      const f = this.switchOnSynchro
      assert(reactiveUser, '!reactiveUser')
      // reactiveUser.wsRevision - версия мастерской по мнению сервера
      assert(reactiveUser.wsRevision >= 0, '!reactiveUser.wsRevision')
      assert(reactiveUser.wsVersion, '!reactiveUser.wsVersion')
      this.reactiveUser = reactiveUser
   }

   switchOnSynchro () { // для гостей мастерская НЕ синхронится с сервером!
      const f = this.switchOnSynchro
      this.synchro = true
      this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
   }

   switchOffSynchro () {
      this.synchro = false
   }

   // работает в фоне и запускается по мере необходимости см ( switchOnSynchro )
   async synchronize () {
      const f = this.synchronize
      logD(f, 'start')
      const t1 = performance.now()
      // запросит при необходимости данные и сольет с локальными изменениями
      const synchronizeWsWhole = async (forceMerge = false) => {
         const f = synchronizeWsWhole
         logD(f, 'start')
         const t1 = performance.now()
         assert(this.reactiveUser && this.reactiveUser.wsRevision >= 0, '!wsRevision')
         let wsFetchDate = await rxdb.get(RxCollectionEnum.META, 'wsFetchDate')
         let wsRevisionLocal = parseInt(await rxdb.get(RxCollectionEnum.META, 'wsRevision')) || -1
         let wsVersionLocal = await rxdb.get(RxCollectionEnum.META, 'wsVersion') || Date.now()
         //  reactiveUser.wsRevision - ревизия мастерской по мнению сервера (меняется в processEvent и при первой загрузке приложения)
         //  reactiveUser.wsVersion - версия мастерской (меняется сервером после пересоздания мастерской)
         if (forceMerge || wsRevisionLocal !== this.reactiveUser.wsRevision || !wsFetchDate || wsVersionLocal !== this.reactiveUser.wsVersion) {
            let wsServer = await WorkspaceApi.getWs()
            logD(f, 'try merge ws...', wsServer)
            // console.time('tm merge ws')
            let itemsServer = []
            for (let wsItemTypeEnum in WsItemTypeEnum) {
               if (wsServer[wsItemTypeEnum]) itemsServer.push(...wsServer[wsItemTypeEnum])
            }
            for (let itemServer of itemsServer) itemServer.synchronized = true
            let newItems = []
            let outdatedItems = []
            let extraItems = []
            if (wsVersionLocal === wsServer.ver) {
               let itemsLocal = await this.db.ws_items.find().exec()
               let unsavedIds = new Set((await this.db.ws_changes.find().exec()).map(item => item.id))

               // есть на сервере, но нет у нас (эти надо вставить!)
               newItems = differenceWith(itemsServer, itemsLocal, (serverItem, localItem) => {
                  return serverItem.id === localItem.id
               })
               // есть и на сервере и у нас, но у нас - устаревшая копия
               outdatedItems = intersectionWith(itemsServer, itemsLocal, (serverItem, localItem) => {
                  return serverItem.id === localItem.id && (serverItem.rev !== localItem.rev || serverItem.updatedAt > localItem.updatedAt)
               })
               // есть у нас, но нет на сервере. (надо удалить у нас)
               extraItems = differenceWith(itemsLocal, itemsServer, (localItem, serverItem) => {
                  return serverItem.id === localItem.id
               }).filter(item => !unsavedIds.has(item.id)) // только те, что НЕ были изменены c момента последнего сохранения
               // logD(f, 'merge ws.(newItems, outdatedItems, extraItems):', newItems, outdatedItems, extraItems)
            } else { // на сервере совсем другая мастерская. Берем только ее (свои изменения убиваем)
               await this.db.ws_items.find().remove() // удаялем все локальные! на сервере - другая мастерская
               newItems = itemsServer
            }
            await this.db.ws_items.bulkInsert(newItems)
            for (let outdated of outdatedItems) await this.db.ws_items.atomicUpsert(outdated)
            if (extraItems.length) await this.db.ws_items.find({ selector: { id: { $in: extraItems.map(item => item.id) } } }).remove() // удаялем те, которых нет на сервере
            await rxdb.set(RxCollectionEnum.META, { id: 'wsFetchDate', valueString: (new Date()).toISOString() })
            await rxdb.set(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsServer.rev.toString() })
            await rxdb.set(RxCollectionEnum.META, { id: 'wsVersion', valueString: wsServer.ver.toString() })
            this.reactiveUser.wsRevision = wsServer.rev // ревизия по мнению сервера
            this.reactiveUser.wsVersion = wsServer.ver // версия мастерской по мнению сервера
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         }
         await rxdb.set(RxCollectionEnum.META, { id: 'wsSynchroDate', valueString: (new Date()).toISOString() })
      }
      // отправить изменения на сервер
      const saveToServer = async (wsOperationEnum, item, wsRevision, wsVersion) => {
         assert(item && item.id, '!item')
         assert(wsRevision, '!wsRevision')
         assert(this.created, '!this.created')
         assert(!('synchronized' in item), '!!(synchronized in item)')
         const f = saveToServer
         logD(f, `start ${item.id} rev:${item.rev}`)
         const t1 = performance.now()
         assert(wsOperationEnum in WsOperationEnum, 'bad operation' + wsOperationEnum)
         if (wsOperationEnum === WsOperationEnum.UPSERT) {
            await WorkspaceApi.wsItemUpsert(item, wsRevision, wsVersion)
         } else {
            if (item.rev) { // если нет rev - то элемент еще не создавался на сервере
               await WorkspaceApi.wsItemDelete(item, wsRevision, wsVersion)
            }
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }

      // заполняем с сервера (если еще не заполено)
      await synchronizeWsWhole()
      let unsavedItems = await this.db.ws_changes.find().exec()
      let wsRevision = this.reactiveUser.wsRevision
      for (let rxDocUnsavedItem of unsavedItems) {
         let { id, operation, rev } = rxDocUnsavedItem
         let plainDoc
         if (operation === WsOperationEnum.DELETE) {
            plainDoc = { id, wsItemType: getRxCollectionEnumFromId(id), rev }
         } else {
            let rxDoc = await this.db.ws_items.findOne(id).exec()
            if (!rxDoc) { // в мастерской нет такого элемента!
               await this.db.ws_changes.find({ selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
               continue
            }
            plainDoc = rxDoc.toJSON()
            delete plainDoc.synchronized
         }
         try {
            // сначала удаляем из очереди, а потом шлем на отправку (processEvent сработает быстрее, чем закончится saveToServer)
            await this.db.ws_changes.find({ selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
            await saveToServer(operation, plainDoc, wsRevision++, this.reactiveUser.wsVersion)
            this.synchroLoopWaitObj.setTimeout(synchroTimeDefault)
         } catch (err) {
            if (err.networkError) { // если ошибка не сетевая - увеличить интервал
               logD(f, 'неудачная попытка отправить данные на сервер. проблемы сети. попоробуем позже...', err)
               this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeDefault * 10))
               await this.db.ws_changes.upsert(rxDocUnsavedItem.toJSON()) // вставляем обратно
            } else {
               try {
                  logE(f, 'критическая ошибка при отправке! пробуем слиться с сервером', err)
                  await synchronizeWsWhole(true)
                  this.synchroLoopWaitObj.setTimeout(synchroTimeDefault)
               } catch (err) {
                  logE(f, 'неудачная синхронизация  с сервером', err)
                  if (err.networkError) {
                     this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeDefault * 10))
                     await this.db.ws_changes.upsert(rxDocUnsavedItem.toJSON()) // вставляем обратно
                  }
               }
            }
         }
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // от сервера прилетел эвент об изменении в мастерской (скорей всего - ответ на наши действия)
   async processEvent (event) {
      const f = this.processEvent
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await this.lock('rxdb::ws::processEvent')
         let { type, wsItem: itemServer, wsRevision } = event
         assert(this.created, '!this.created')
         assert(this.reactiveUser, '!this.reactiveUser') // почему я получил этот эвент, если я гость???
         assert(itemServer.id && itemServer.rev, 'assert itemServer !check')
         assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
         itemServer.synchronized = true
         let wsRevisionLocal = parseInt(await rxdb.get(RxCollectionEnum.META, 'wsRevision')) || 0 // версия локальной мастерской
         await this.reactiveUser.updateExtended('wsRevision', wsRevision, false) // версия мастерской по мнению сервера (сохраняем в this.reactiveUser.wsRevision - нужно для synchronizeWsWhole)
         if (wsRevisionLocal + 1 !== wsRevision) { // мы пропустили некоторые изменения надо синхронизировать всю мастерскую (synchronizeWsWhole)
            logW(f, `WS expired! wsRevisionLocal=${wsRevisionLocal} wsRevisionServer=${wsRevision}`)
            // здесь нельзя явно вызывать synchronizeWsWhole !!! в следующем цикле будет проведена синхронизация (см this.synchroLoop)
            return
         }
         // ищем изменившейся item
         assert(itemServer.wsItemType in RxCollectionEnum, 'itemServer.wsItemType in RxCollectionEnum)')
         let reactiveItem = await rxdb.get(null, null, { id: itemServer.id })
         // применим изменения
         if (!reactiveItem || type === 'WS_ITEM_DELETED' || reactiveItem.rev + 1 < itemServer.rev || reactiveItem.updatedAt < itemServer.updatedAt) {
            logD(f, 'Берем изменения с сервера', type)
            if (reactiveItem && type === 'WS_ITEM_DELETED') {
               // logD('try remove ws item', await this.db.ws_items.find({ selector: { id: itemServer.id } }).exec())
               await reactiveItem.updateExtended('synchronized', true, false, false)// пометим итем как не подлежащий синхронизации (см this.db.ws_items.postRemove)
               await this.db.ws_items.find({ selector: { id: itemServer.id } }).remove()
            } else {
               // logD(f, 'try update ws item')
               assert(itemServer.synchronized, '!itemServer.synchronized')
               await this.db.ws_items.atomicUpsert(itemServer) // itemServer.synchronized === true (не подлежит синхронизации (см this.db.ws_items.postInsert/postSave))
            }
            await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
         } else {
            logD(f, `event проигнорирован (у нас актуальная версия) ${reactiveItem.id} rev: ${reactiveItem.rev}`)
            // просто возьмем ревизию с сервера (нальзя полностью менять данные тк у нас могут быть данные свежее, чем на сервере)
            await reactiveItem.updateExtended('rev', itemServer.rev, false, false) // ревизию назначает сервер. это изменение не попадает в ws_changes (synchro = false)
         }
         // все пришедшие изменения применены. Актуализируем версию локальной мастерской (см synchronizeWsWhole)
         await rxdb.set(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsRevision.toString() })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
         // logD(f, 'unlocked')
      }
   }

   async find (mangoQuery) {
      const f = this.find
      try {
         // await this.lock('rxdb::ws::find')
         // logD(f, 'locked') см set
         assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 2' + JSON.stringify(mangoQuery))
         let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
         assert(rxCollectionEnum in WsCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
         delete mangoQuery.selector.rxCollectionEnum
         if (rxCollectionEnum !== WsCollectionEnum.WS_ANY) mangoQuery.selector.wsItemType = rxCollectionEnum
         let rxQuery = this.db.ws_items.find(mangoQuery)
         return rxQuery
      } finally {
         // this.release()
         // logD(f, 'unlocked')
      }
   }

   async set (item) {
      const f = this.set
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await this.lock('rxdb::ws::set')
         assert(this.created, '!this.created')
         let itemCopy = JSON.parse(JSON.stringify(item))
         if (itemCopy.wsItemType === 'WS_NODE') {
            itemCopy.contentOids = itemCopy.items.reduce((acc, val) => {
               val.layers.map(l => {
                  acc.push(l.contentOid)
               })
               return acc
            }, [])
         }
         assert(itemCopy.wsItemType in WsItemTypeEnum, 'bad wsItemType:' + itemCopy.g)
         itemCopy.updatedAt = Date.now()
         if (!itemCopy.createdAt) itemCopy.createdAt = Date.now()
         if (!itemCopy.id) itemCopy.id = `${itemCopy.wsItemType}::${Date.now()}::{}` // генерируем id для нового элемента
         let rxDoc = await this.db.ws_items.atomicUpsert(itemCopy)
         assert(isRxDocument(rxDoc), '!isRxDocument' + JSON.stringify(rxDoc))
         { // если синхронизация давно не делалась - форсируем (нужно для кейса, когда мастерская была очищена из другой вкладки)
            let wsSynchroDateStr = await rxdb.get(RxCollectionEnum.META, 'wsSynchroDate')
            let wsSynchroDate = wsSynchroDateStr ? new Date(wsSynchroDateStr) : new Date(0)
            if ((new Date()) - wsSynchroDate > synchroTimeDefault) {
               this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
            }
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return rxDoc
      } finally {
         this.release()
         // logD(f, 'unlocked')
      }
   }

   async get (id) {
      const f = this.get
      logD(f, 'start', id)
      const t1 = performance.now()
      try {
         // await this.lock('rxdb::ws::get') вызывается внутри processEvent
         // logD(f, 'locked')
         let rxDoc = await this.db.ws_items.findOne(id).exec()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return rxDoc
      } finally {
         // this.release()
         // logD(f, 'unlocked')
      }
   }

   async remove (id) {
      const f = this.remove
      logD(f, 'start', id)
      try {
         await this.lock('rxdb::ws::remove')
         // logD(f, 'locked')
         assert(this.created, '!this.created')

         let removedItem = await this.db.ws_items.findOne(id).exec()
         assert(removedItem, '!removedItem')
         if (removedItem.wsItemType === WsItemTypeEnum.WS_COLLECTION) {
            // удалить себя из всех bookmarks
            assert(removedItem.bookmarks, '!removedItem.bookmarks')
            // let bookmarks = await rxdb.find({
            //    selector: {
            //       rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
            //       oid: objectShortOrWsBookmark.oid
            //    }
            // })


         } else if (removedItem.wsItemType === WsItemTypeEnum.WS_BOOKMARK) {
            // удалить себя из всех коллекций
            assert(removedItem.collections, '!removedItem.collections')
         }
         await removedItem.remove()
         // await this.db.ws_items.find({ selector: { id: id } }).remove()
      } finally {
         this.release()
         // logD(f, 'unlocked')
      }
   }

   async lock (lockOwner) {
      await this.mutex.lock(lockOwner)
   }

   release () {
      this.mutex.release()
   }

   // добавить методы для работы с итемом
   populateReactiveItem (reactiveItem) {
      if (reactiveItem.wsItemType === WsItemTypeEnum.WS_COLLECTION) {
         // добавиить в коллекцию объект с ленты или букмарк
         const reactiveCollection = reactiveItem
         reactiveCollection.addItemToCollection = async (objectShortOrWsBookmark) => {
            let bm
            if (objectShortOrWsBookmark.wsItemType) { // добавить букмарк в коллекцию
               assert(objectShortOrWsBookmark.wsItemType === WsItemTypeEnum.WS_BOOKMARK, '!objectShortOrWsBookmark.wsItemType === WsItemTypeEnum.WS_BOOKMARK')
               bm = objectShortOrWsBookmark
            } else { // найти / создать букмарк из objectShort и добавить его в коллекцию
               assert(objectShortOrWsBookmark.oid && objectShortOrWsBookmark.type && objectShortOrWsBookmark.thumbUrl, '!objectShortOrWsBookmark.oid')
               let [found] = await rxdb.find({
                  selector: {
                     rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
                     oid: objectShortOrWsBookmark.oid
                  }
               })
               if (found) bm = found
               else {
                  let objBookmarkInput = {
                     oid: objectShortOrWsBookmark.oid,
                     name: objectShortOrWsBookmark.name,
                     thumbUrl: objectShortOrWsBookmark.thumbUrl,
                     type: objectShortOrWsBookmark.type,
                     wsItemType: 'WS_BOOKMARK',
                     collections: []
                  }
                  bm = await rxdb.set(RxCollectionEnum.WS_BOOKMARK, objBookmarkInput)
               }
            }
            if (!bm.collections.includes(reactiveCollection.id)) bm.collections.push(reactiveCollection.id)
            if (!reactiveCollection.bookmarks.includes(bm.id)) reactiveCollection.bookmarks.push(bm.id)
         }
         reactiveCollection.removeItemFromCollection = async (wsBookmark) => {
            assert(wsBookmark && wsBookmark.wsItemType === WsItemTypeEnum.WS_BOOKMARK, '!wsBookmark && wsBookmark.wsItemType === WsItemTypeEnum.WS_BOOKMARK')
            wsBookmark.collections = wsBookmark.collections.filter(id => id !== reactiveCollection.id)
            reactiveCollection.bookmarks = reactiveCollection.bookmarks.filter(id => id !== wsBookmark.id)
         }
      }
   }
}

export { Workspace, WsCollectionEnum, WsItemTypeEnum }
