import { assert, wait } from 'src/system/common/utils'
import {
   RxCollectionEnum,
   rxdbOperationProxy,
   rxdbOperationProxyExec,
   WsCollectionEnum,
   WsItemTypeEnum
} from 'src/system/rxdb/common'
import { cacheSchema, schemaKeyValue, wsSchemaItem, wsSchemaLocalChanges } from 'src/system/rxdb/schemas'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { WorkspaceApi } from 'src/api/workspace'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import intersectionWith from 'lodash/intersectionWith'
import { getRxCollectionEnumFromId, rxdb } from 'src/system/rxdb'
import { isRxDocument } from 'rxdb'
import { updateRxDocPayload } from 'src/system/rxdb/reactive'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB_WS)

const synchroTimeDefault = 1000 * 60 * 1 // раз в 1 минут шлем изменения на сервер
// const synchroTimeDefault = 1000 * 10 // раз в 1 минут шлем изменения на сервер
if (synchroTimeDefault < 1000 * 60 * 1) logE('TODO increase synchroTimeDefault')
// logE('synchroTimeDefault!!! 1000 * 10')
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

const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

// Workspace вызывается 1: из UI(upsertItem/deleteItem); 2: из сети(processEvent); 3: synchroLoop.
// Эти ф-ии сериализованы(вызываются строго друг за другом) (см MutexLocal)
class Workspace {
   constructor () {
      this.mutex = new MutexLocal('rxdb::ws')
      this.reactiveUser = null
      this.synchro = false
      this.synchroLoopWaitObj = new WaitBreakable(synchroTimeDefault)
   }

   async destroy (clearStorageMethod) {
      await this.switchOffSynchro() // до await this.lock
      try {
         await this.lock('ws::destroy')
         this.created = false
         if (clearStorageMethod === 'destroy') {
            if (this.db && this.db.ws_items) await rxdbOperationProxyExec(this.db.ws_items, 'destroy')
            if (this.db && this.db.ws_changes) await rxdbOperationProxyExec(this.db.ws_changes, 'destroy')
         } else if (clearStorageMethod === 'remove_collections') {
            if (this.db && this.db.ws_items) await rxdbOperationProxyExec(this.db.ws_items, 'remove')
            if (this.db && this.db.ws_changes) await rxdbOperationProxyExec(this.db.ws_changes, 'remove')
         } else if (clearStorageMethod === 'remove_rows') {
            if (this.db && this.db.ws_items) {
               let query = rxdbOperationProxy(this.db.ws_items, 'find')
               await query.remove();
            }
            if (this.db && this.db.ws_changes) {
               let query = rxdbOperationProxy(this.db.ws_changes, 'find')
               await query.remove();
            }
         }
         this.db = null
         this.store.commit('core/stateSet', ['wsReady', false])
      } finally {
         this.release()
      }
   }

   async create (db, store) {
      const f = this.create
      const t1 = performance.now()
      assert(db && store)
      try {
         await this.lock('create')
         this.db = db
         this.store = store
         if (!this.db.ws_items) {
            await this.db.addCollections({
               ws_items: {
                  schema: wsSchemaItem,
                  migrationStrategies: {
                     // ..., - см wsSchemaItem.version (из schema.js)
                     1: oldDoc => oldDoc,
                     2: oldDoc => oldDoc,
                     3: oldDoc => oldDoc
                  }
               }
            })
         }
         if (!this.db.ws_changes) await this.db.addCollections({ ws_changes: { schema: wsSchemaLocalChanges } })
         assert(this.db.ws_items && this.db.ws_changes, '!this.db.ws_items && this.db.ws_changes')
         // обработка события измения мастерской пользователем (запоминает измененные элементы)
         let onWsChangedByUser = async (id, operation, plainData) => {
            assert(id && operation && operation in WsOperationEnum, 'bad params' + id + operation)
            assert('hasChanges' in plainData, '! hasChanges in plainData')
            if (plainData.hasChanges || operation === WsOperationEnum.DELETE) {
               let deletedDocs = await rxdbOperationProxyExec(this.db.ws_changes, 'find', {
                  selector: {
                     id,
                     operation: WsOperationEnum.DELETE
                  }
               })
               if (deletedDocs.length === 0) { // только если не удален
                  await rxdbOperationProxyExec(this.db.ws_changes, 'atomicUpsert', {
                     id,
                     operation,
                     rev: plainData.rev
                  })
               }
            }
         }
         const initWsItem = (plainData) => {
            assert(plainData.wsItemType, '!plainData.wsItemType')
            plainData.rev = plainData.rev || 0
            if (plainData.wsItemType === WsItemTypeEnum.WS_SPHERE){
               plainData.wsSphereItems = plainData.wsSphereItems || []
            } else {
               plainData.wsSpheres = plainData.wsSpheres || []
            }
         }
         this.db.ws_items.preSave(async (plainData, rxDoc) => {
            initWsItem(plainData)
            let plainDataCopy = cloneDeep(plainData) // newVal
            let rxDocCopy = cloneDeep(rxDoc.toJSON()) // oldVal
            delete plainDataCopy._rev // внутреннее св-во rxdb (мешает при сравненении)
            delete plainDataCopy.rev // rev - присваивается сервером (не реагируем на изменения rev (это происходит в processEvent))
            delete rxDocCopy.rev
            delete plainDataCopy.hasChanges
            delete rxDocCopy.hasChanges
            if (isEqual(plainDataCopy, rxDocCopy)) {
               // реальных изменений нет! изменена ТОЛЬКО ревизия. На сервер ничего слать не надо (иначе будет бесконечный цикл)
               plainData.hasChanges = false // будет проверено в this.db.ws_items.postSave
            }
         }, false)
         this.db.ws_items.preInsert(async (plainData) => {
            initWsItem(plainData)
         }, false)
         this.db.ws_items.postSave(async (plainData, rxDoc) => {
            // сработает НЕ на всех вкладках (только на той, что изменила итем)
            await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT, plainData)
         }, false)
         this.db.ws_items.postInsert(async (plainData) => {
            // сработает НЕ на всех вкладках (только на той, что изменила итем)
            await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT, plainData)
         }, false)
         this.db.ws_items.postRemove(async (plainData) => {
            if (!this.created) return // см. destroy ('remove_rows')
            // сработает НЕ на всех вкладках (только на той, что изменила итем)
            // если !rev - то элемент еще не создавался на сервере (удалять с сервера не надо его) либо его там УЖЕ нет (см synchronize)
            logD('postRemove')
            if (plainData.rev) await onWsChangedByUser(plainData.id, WsOperationEnum.DELETE, plainData)
            rxdb.onRxDocDelete(plainData.id) // удалить из lru(иначе он будет находиться через rxdb.get())
            // plainData.deletedAt = Date.now()
         }, false)

         if (!this.synchroLoop) {
            // синхроним изменения в цикле
            this.synchroLoop = async () => {
               const f = this.synchroLoop
               f.nameExtra = 'synchroLoop'
               logD(f, 'start')
               while (true) {
                  if (this.created && this.db && this.reactiveUser && this.synchro && rxdb.hasCurrentUser && mutexGlobal.isLeader()) {
                     try {
                        await mutexGlobal.lock('ws::synchroLoop')
                        await this.lock('ws::synchroLoop')
                        await this.synchronize()
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
            this.synchroLoop().catch(err => logE(f, 'не удалось запустить цикл синхронизации', err))
         }
         this.created = true
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, this.created)
      } finally {
         this.release()
      }
   }

   switchOnSynchro (reactiveUser) { // для гостей мастерская НЕ синхронится с сервером!
      const f = this.switchOnSynchro
      assert(reactiveUser, '!reactiveUser')
      assert(reactiveUser.oid, '!reactiveUser.oid')
      // reactiveUser.wsRevision - версия мастерской по мнению сервера
      assert(reactiveUser.wsRevision >= 0, '!reactiveUser.wsRevision')
      assert(reactiveUser.wsVersion, '!reactiveUser.wsVersion')
      this.reactiveUser = reactiveUser

      this.synchro = true
      this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
   }

   async switchOffSynchro () {
      this.synchro = false
      this.reactiveUser = null
      await this.lock('ws::switchOffSynchro') // ждем пока завершится synchroLoop (если он запущен)
      this.release()
   }

   // работает в фоне и запускается по мере необходимости см ( switchOnSynchro )
   async synchronize () {
      const f = this.synchronize
      logT(f, 'start')
      const t1 = performance.now()
      // запросит при необходимости данные и сольет с локальными изменениями
      const synchronizeWsWhole = async (forceMerge = false) => {
         const f = synchronizeWsWhole
         logT(f, 'start')
         const t1 = performance.now()
         assert(this.reactiveUser && this.reactiveUser.wsRevision >= 0, '!wsRevision')
         let wsFetchDate = await rxdb.get(RxCollectionEnum.META, 'wsFetchDate')
         let wsRevisionLocal = parseInt(await rxdb.get(RxCollectionEnum.META, 'wsRevision')) || -1
         let wsVersionLocal = await rxdb.get(RxCollectionEnum.META, 'wsVersion') || Date.now()
         //  reactiveUser.wsRevision - ревизия мастерской по мнению сервера (меняется в processEvent и при первой загрузке приложения)
         //  reactiveUser.wsVersion - версия мастерской (меняется сервером после пересоздания мастерской)
         if (forceMerge || wsRevisionLocal !== this.reactiveUser.wsRevision || !wsFetchDate || wsVersionLocal !== this.reactiveUser.wsVersion) {
            logT(f, 'need merge1!')
            let wsServer = await WorkspaceApi.getWs()
            let itemsServer = []
            for (let wsItemTypeEnum in WsItemTypeEnum) {
               if (wsServer[wsItemTypeEnum]) itemsServer.push(...wsServer[wsItemTypeEnum])
            }
            for (let itemServer of itemsServer) itemServer.hasChanges = false
            let itemsLocal = await rxdbOperationProxyExec(this.db.ws_items, 'find')
            let localMap = Object.fromEntries(itemsLocal.map(item => [item.id, item]))
            let serverMap = Object.fromEntries(itemsServer.map(item => [item.id, item]))
            let newItems = []
            let outdatedItems = []
            let extraItems = []
            logT(f, 'need merge2!', wsVersionLocal, wsServer.ver)
            if (wsVersionLocal === wsServer.ver) {
               logT(f, 'try merge local ws with server...')
               let unsavedIds = new Set((await rxdbOperationProxyExec(this.db.ws_changes, 'find')).map(item => item.id))
               // есть на сервере, но нет у нас (эти надо вставить!)
               newItems = itemsServer.filter(item => !localMap[item.id])
               // есть и на сервере и у нас, но у нас - устаревшая копия
               outdatedItems = itemsServer.filter(item => localMap[item.id] && (item.rev !== localMap[item.id].rev || item.updatedAt > localMap[item.id].updatedAt))
               if (outdatedItems.length > 100) {
                  // TODO убрать
                  logW('outdatedItems.length > 100 outdatedItems:', cloneDeep(outdatedItems))
                  logW('outdatedItems.length > 100 itemsServer:', cloneDeep(itemsServer))
                  logW('outdatedItems.length > 100 itemsLocal:', cloneDeep(itemsLocal))
                  logW('outdatedItems.length > 100 localMap:', cloneDeep(localMap))
               }
               // есть у нас, но нет на сервере. (надо удалить у нас)
               extraItems = itemsLocal.filter(item => !serverMap[item.id])
                  .filter(item => !unsavedIds.has(item.id)) // только те, что НЕ были изменены c момента последнего сохранения
               if (newItems.length || outdatedItems.length || extraItems.length) logT(f, 'merge ws.(newItems, outdatedItems, extraItems):', newItems.length, outdatedItems.length, extraItems.length)
            } else { // на сервере совсем другая мастерская. Берем только ее (свои изменения убиваем)
               logT(f, 'remove local ws. pick server ws!')
               extraItems = itemsLocal // удаялем все локальные! на сервере - другая мастерская
               newItems = itemsServer
            }
            if (extraItems.length) { // удаляем те, которых нет на сервере
               let query = rxdbOperationProxy(this.db.ws_items, 'find', { selector: { id: { $in: extraItems.map(item => item.id) } } })
               await query.update({ $set: { rev: 0 } }) // для того чтобы события об удалении не отправлялись на сервер`(см postRemove)
               await query.remove()
            }
            logT('try insert newItems', newItems.length)
            await rxdbOperationProxyExec(this.db.ws_items, 'bulkInsert', newItems)
            logT('try atomicUpsert outdated', outdatedItems.length)
            for (let outdated of outdatedItems) await rxdbOperationProxyExec(this.db.ws_items, 'atomicUpsert', outdated)
            logT('atomicUpsert complete')
            await rxdb.set(RxCollectionEnum.META, { id: 'wsFetchDate', valueString: (new Date()).toISOString() })
            await rxdb.set(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsServer.rev.toString() })
            await rxdb.set(RxCollectionEnum.META, { id: 'wsVersion', valueString: wsServer.ver.toString() })
            this.reactiveUser.wsRevision = wsServer.rev // ревизия по мнению сервера
            this.reactiveUser.wsVersion = wsServer.ver // версия мастерской по мнению сервера
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         }
         await rxdb.set(RxCollectionEnum.META, { id: 'wsSynchroDate', valueString: (new Date()).toISOString() })
      }
      const clearTrash = async () => {
         await rxdbOperationProxy(this.db.ws_items, 'find', {
            selector: { deletedAt: { $gt: 0 } },
            sort: [{ deletedAt: 'desc' }] // в начале списка те, что удалены недавно)
         }).skip(1000).remove() // оставляем максимум 1000 последних
         await rxdbOperationProxy(this.db.ws_items, 'find', {
            selector: {
               $and: [
                  { deletedAt: { $gt: 0 } },
                  { deletedAt: { $lt: Date.now() - 1000 * 60 * 60 * 24 * 30 } }
               ]
            }
         }).remove() // удаляем, те что старше месяца
      }
      await clearTrash()

      // заполняем с сервера (если еще не заполено)
      await synchronizeWsWhole()
      let unsavedItems = (await rxdbOperationProxyExec(this.db.ws_changes, 'find')).map(rxDoc => cloneDeep(rxDoc.toJSON())) // убираем реактивность
      let wsRevisionLocal = parseInt(await rxdb.get(RxCollectionEnum.META, 'wsRevision')) || -1
      let wsVersionLocal = await rxdb.get(RxCollectionEnum.META, 'wsVersion') || Date.now()
      let operations = []
      // todo - по идее это избыточно (processEvent не завязан на этот список) - убрать после презентации
      // сначала удаляем из очереди, а потом шлем на отправку (processEvent может сработать в другой вкладке до того как  закончится saveToServer)
      await rxdbOperationProxy(this.db.ws_changes, 'find').remove() // удаляем информацию из очереди на отправку
      for (let unsavedItem of unsavedItems) {
         let { id, operation, rev } = unsavedItem
         let wsItemInput
         if (operation === WsOperationEnum.DELETE) {
            wsItemInput = { id, wsItemType: getRxCollectionEnumFromId(id), rev }
         } else {
            let rxDoc = await rxdbOperationProxyExec(this.db.ws_items, 'findOne', id)
            if (!rxDoc) { // в мастерской нет такого элемента!
               await rxdbOperationProxy(this.db.ws_changes, 'find', { selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
               continue
            }
            wsItemInput = cloneDeep(rxDoc.toJSON())
            delete wsItemInput.hasChanges // это системное поле (не надо отправлять на сервер)
         }
         operations.push({ operation, wsItemInput })
      }
      try {
         if (operations.length) {
            await WorkspaceApi.wsBatchOperation(operations, wsRevisionLocal, wsVersionLocal)
         }
         this.synchroLoopWaitObj.setTimeout(synchroTimeDefault)
      } catch (err) {
         if (err.networkError) { // если ошибка не сетевая - увеличить интервал
            logT(f, 'неудачная попытка отправить данные на сервер. проблемы сети. попоробуем позже...', err)
            this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeDefault * 10))
            await rxdbOperationProxyExec(this.db.ws_changes, 'bulkInsert', unsavedItems)// вставляем обратно
         } else {
            try {
               logE(f, 'критическая ошибка при отправке! пробуем слиться с сервером', err)
               await synchronizeWsWhole(true)
               this.synchroLoopWaitObj.setTimeout(synchroTimeDefault)
            } catch (err) {
               logE(f, 'неудачная синхронизация  с сервером', err)
               if (err.networkError) {
                  this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeDefault * 10))
                  await rxdbOperationProxyExec(this.db.ws_changes, 'bulkInsert', unsavedItems)// вставляем обратно
               }
            }
         }
      }
      this.store.commit('core/stateSet', ['wsReady', true])
      logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`, unsavedItems)
   }

   // от сервера прилетел эвент об изменении в мастерской (скорей всего - ответ на наши действия)
   async processEvent (event) {
      const f = this.processEvent
      const t1 = performance.now()
      logT(f, 'start', event)
      let { type, wsItem: itemServer, wsRevision } = event
      assert(this.created, '!this.created')
      assert(this.reactiveUser, '!this.reactiveUser') // почему я получил этот эвент, если я гость???
      assert(itemServer.id && itemServer.rev, 'assert itemServer !check')
      assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
      try {
         await this.lock('rxdb::ws::processEvent')
         itemServer.hasChanges = false
         let wsRevisionLocal = parseInt(await rxdb.get(RxCollectionEnum.META, 'wsRevision')) || 0 // версия локальной мастерской
         await this.reactiveUser.updateExtended('wsRevision', wsRevision, false) // версия мастерской по мнению сервера (сохраняем в this.reactiveUser.wsRevision - нужно для synchronizeWsWhole)
         if (wsRevisionLocal !== wsRevision && wsRevisionLocal + 1 !== wsRevision) { // мы пропустили некоторые изменения надо синхронизировать всю мастерскую (synchronizeWsWhole)
            logW(f, `WS expired! wsRevisionLocal=${wsRevisionLocal} wsRevisionServer=${wsRevision}`)
            // здесь нельзя явно вызывать synchronizeWsWhole
            this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
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
               await reactiveItem.updateExtended('hasChanges', false, false, false)// пометим итем как не подлежащий синхронизации (см this.db.ws_items.postRemove)
               await rxdbOperationProxy(this.db.ws_items, 'find', { selector: { id: itemServer.id } }).remove()
            } else if (type !== 'WS_ITEM_DELETED') {
               // logD(f, 'try update ws item')
               assert(!itemServer.hasChanges, 'itemServer.hasChanges')
               await rxdbOperationProxyExec(this.db.ws_items, 'atomicUpsert', itemServer) // itemServer.hasChanges === false (не подлежит синхронизации (см this.db.ws_items.postInsert/postSave))
            }
            await rxdbOperationProxy(this.db.ws_changes, 'find', { selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
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
      assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 2' + JSON.stringify(mangoQuery))
      let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
      assert(rxCollectionEnum in WsCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      delete mangoQuery.selector.rxCollectionEnum
      if (!mangoQuery.selector.deletedAt) mangoQuery.selector.deletedAt = { $eq: 0 } // не выводить удаленные

      // не актуально для lokiJS! mangoQuery.selector._deleted = { $exists: false } // не выводить реально удаленные ( да! rxdb по умолчанию выводит! )
      if (rxCollectionEnum !== WsCollectionEnum.WS_ANY) mangoQuery.selector.wsItemType = rxCollectionEnum
      let rxQuery = rxdbOperationProxy(this.db.ws_items, 'find', mangoQuery)
      return rxQuery
   }

   async set (item) {
      assert(item.wsItemType in WsItemTypeEnum, '!itemCopy.wsItemType in WsItemTypeEnum')
      const f = this.set
      logD(f, 'start')
      const t1 = performance.now()
      let existingOtherRxDoc
      try {
         await this.lock('rxdb::ws::set') // нельзя чтобы метод сработал во время synchronize
         assert(this.created, '!this.created')
         let itemCopy = JSON.parse(JSON.stringify(item))
         if (itemCopy.wsItemType === WsItemTypeEnum.WS_SPHERE) {
            const foundOtherDocs = await rxdbOperationProxyExec(this.db.ws_items, 'find', {
               selector: {
                  wsItemType: RxCollectionEnum.WS_SPHERE,
                  name: itemCopy.name,
                  id: { $ne: itemCopy.id || 0 }
               }
            })
            existingOtherRxDoc = foundOtherDocs[0]
         }
         let resultRxDoc
         if (existingOtherRxDoc){
            if (!itemCopy.id) { // создание нового элемента
               if (existingOtherRxDoc.deletedAt || (!existingOtherRxDoc.oid && item.oid)) {
                  await updateRxDocPayload(existingOtherRxDoc, '', oldData => {
                     oldData.deletedAt = undefined
                     oldData.oid = oldData.oid || item.oid
                     return oldData
                  }, false)
               }
            } else { // изменение существующего элемента
               throw new Error(`other sphere with same name found! cant change name to ${itemCopy.name}`) // нельзя изменить имя на itemCopy.name (такое уже есть)
            }
            resultRxDoc = existingOtherRxDoc // вернем существующий
         } else {
            itemCopy.updatedAt = Date.now()
            if (!itemCopy.createdAt) itemCopy.createdAt = Date.now()
            if (!itemCopy.id) itemCopy.id = `${itemCopy.wsItemType}::${Date.now()}::{}` // генерируем id для нового элемента
            resultRxDoc = await rxdbOperationProxyExec(this.db.ws_items, 'atomicUpsert', itemCopy)
         }
         { // если синхронизация давно не делалась - форсируем (нужно для кейса, когда мастерская была очищена из другой вкладки)
            let wsSynchroDateStr = await rxdb.get(RxCollectionEnum.META, 'wsSynchroDate')
            let wsSynchroDate = wsSynchroDateStr ? new Date(wsSynchroDateStr) : new Date(0)
            if ((new Date()) - wsSynchroDate > synchroTimeDefault) {
               this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
            }
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return resultRxDoc
      } finally {
         this.release()
         // logD(f, 'unlocked')
      }
   }

   // проанализировать wsItem. Вытащить из него все сферы и добавить их в мастерскую
   async updateWsSpheres(wsItemRxDoc) {
      if (wsItemRxDoc.wsItemType === WsItemTypeEnum.WS_HISTORY) return // не обновляем сферы для ядер, которые польжователь просто серфит
      // найдем все сферы этой сути и добавим их в мастерскую + добавим себя в newSphere.wsSphereItems
      if (wsItemRxDoc.type && wsItemRxDoc.type.in('NODE', 'JOINT', 'BLOCK') && wsItemRxDoc.oid) {
         logD('try find item spheres')
         // берем только те что есть в кэше ( с сервера не запрашиваем)
         let object = await rxdb.get(RxCollectionEnum.OBJ, wsItemRxDoc.oid, {priority: -1})
         if (!object) return
         let spheres = []
         if (object.sphereFromName) spheres.push(object.sphereFromName)
         if (object.spheres) spheres.push(...object.spheres)
         if (object.items) {
            for (let item of object.items) {
               if (item.sphereFromName) spheres.push(item.sphereFromName)
               if (item.spheres) spheres.push(...item.spheres)
            }
         }
         logD('item spheres', spheres)
         for (let s of spheres) {
            assert(s && s.name && s.oid)
            let sphereInput = {
               name: s.name,
               oid: s.oid
            }
            let newSphere = await rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
            await newSphere.updateExtended('hitCnt', hitCnt => (hitCnt || 0) + 1, false)
            assert(newSphere.wsSphereItems)
            // logT('newSphere add wsSphereItem', cloneDeep(newSphere), cloneDeep(wsItemRxDoc))
            if (!newSphere.wsSphereItems.find(wsItemId => wsItemId === wsItemRxDoc.id)) {
               newSphere.wsSphereItems.push(wsItemRxDoc.id) // добавляем себя
            }
         }
      }
   }

   // добавить на wsItem contentOids(для позиционирования черновиков на контенте)
   async updateContentOids(wsItemRxDoc) {
      assert(wsItemRxDoc && isRxDocument(wsItemRxDoc))
      let getContentOids = (item, type) => {
         assert(type && type in WsItemTypeEnum)
         let result
         if (type === WsItemTypeEnum.WS_NODE) {
            result = item.items.reduce((acc, val) => {
               val.layers.forEach(l => {
                  acc.push(l.contentOid)
               })
               return acc
            }, [])
         } else if (type === WsItemTypeEnum.WS_BLOCK){
            result = [] // todo
         } else if (type === WsItemTypeEnum.WS_JOINT){
            result = [] // todo
         } else return undefined
         return result
      }
      let objectFull
      let contentOids
      if (wsItemRxDoc.type && wsItemRxDoc.type.in('NODE', 'JOINT', 'BLOCK') && wsItemRxDoc.oid) {
         // берем только те что есть в кэше ( с сервера не запрашиваем)
         objectFull = await rxdb.get(RxCollectionEnum.OBJ, wsItemRxDoc.oid, {priority: -1})
      }
      if (objectFull) {
         let type
         if (objectFull.type === 'NODE') type = WsItemTypeEnum.WS_NODE
         else if (objectFull.type === 'JOINT') type = WsItemTypeEnum.WS_JOINT
         else if (objectFull.type === 'BLOCK') type = WsItemTypeEnum.WS_BLOCK
         else throw new Error('bad objectFull.type' + objectFull.type)
         contentOids = getContentOids(objectFull, type)
      } else {
         contentOids = getContentOids(wsItemRxDoc, wsItemRxDoc.wsItemType)
      }
      if (contentOids) await wsItemRxDoc.atomicPatch({ contentOids: contentOids })
   }

   async get (id) {
      const f = this.get
      logD(f, 'start', id)
      const t1 = performance.now()
      let rxDoc = await rxdbOperationProxyExec(this.db.ws_items, 'findOne', id)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
   }

   async remove (id, permanent = false) {
      const f = this.remove
      logD(f, 'start', id)
      try {
         await this.lock('rxdb::ws::remove') // нельзя чтобы метод сработал во время synchronize
         // logD(f, 'locked')
         assert(this.created, '!this.created')
         let removedItem = await rxdb.get(null, null, { id })
         assert(removedItem, '!removedItem')
         await removedItem.remove(permanent)
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
   populateReactiveWsItem (reactiveItem) {
      reactiveItem.beforeRemove = async (permanent = false) => {
         if (reactiveItem.wsItemType === WsItemTypeEnum.WS_SPHERE) {
            const reactiveWsSphere = reactiveItem
            // удалить себя(сферу) из всех wsSphereItems
            assert(reactiveWsSphere.wsSphereItems, '!reactiveWsSphere.wsSphereItems')
            if (permanent) {
               let { items: wsItems } = await rxdb.find({ selector: { id: { $in: reactiveWsSphere.wsSphereItems } } })
               for (let wsItem of wsItems) {
                  assert(wsItem.wsSpheres && Array.isArray(wsItem.wsSpheres))
                  wsItem.wsSpheres = wsItem.wsSpheres.filter(id => id !== reactiveWsSphere.id)
               }
            }
         } else {
            if (reactiveItem.wsSpheres) {
               // удалить себя из всех сфер
               if (permanent && reactiveItem.wsSpheres.length > 0) {
                  let { items: wsSpheres } = await rxdb.find({
                     selector: {
                        rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
                        id: { $in: reactiveItem.wsSpheres }
                     }
                  })
                  for (let s of wsSpheres) {
                     assert(s.wsSphereItems && Array.isArray(s.wsSphereItems))
                     s.wsSphereItems = s.wsSphereItems.filter(id => id !== reactiveItem.id)
                  }
               }
            }
         }
      }
   }
}

export { Workspace, WsCollectionEnum, WsItemTypeEnum }
