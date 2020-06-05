import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'

import assert from 'assert'
import {
  wsSchemaChain,
  wsSchemaContent,
  wsSchemaNode,
  wsSchemaSphere,
  wsSchemaLocalChanges, schemaKeyValue, wsSchemaItem
} from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Mutex } from 'src/system/rxdb/reactive'
import { WorkspaceApi } from 'src/api/workspace'
import { getRxCollectionEnumFromId, RxCollectionEnum, rxdb } from 'src/system/rxdb/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_WS)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_WS)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const synchroTimeMin = 1000 * 60 * 1 // раз в 1 минут шлем изменения на сервер
class WaitBreakable {
  constructor (ms) {
    assert(ms >= synchroTimeMin, 'bad ms')
    this.timeout = ms
  }

  break () {
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
      await wait(Math.min(1000, synchroTimeMin / 2))
    }
  }
}

const WsItemTypeEnum = Object.freeze({
  WS_NODE: 'WS_NODE',
  WS_CONTENT: 'WS_CONTENT',
  WS_CHAIN: 'WS_CHAIN',
  WS_SPHERE: 'WS_SPHERE'
})
const WsCollectionEnum = Object.freeze({
  ...WsItemTypeEnum,
  WS_CHANGES: 'WS_CHANGES'
})
const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

// Workspace вызывается 1: из UI(upsertItem/deleteItem); 2: из сети(processEvent); 3: synchroLoop.
// Эти ф-ии сериализованы(вызываются строго друг за другом) (см Mutex)
class Workspace {
  constructor (db) {
    assert(db, '!rxdb')
    this.db = db
  }

  async createCollections () {
    let f = this.createCollections
    logD(f, 'start')
    // добавлет дефолтный вариант для пропущенных стратегий
    const migrationProxy = (migrationStrategies) => {
      return new Proxy(migrationStrategies, {
        get (target, prop) {
          if (prop in target) {
            let value = target[prop]
            return (typeof value === 'function') ? value.bind(target) : value // иначе - внутри this - будет указывать на Proxy
          } else {
            return (oldDoc) => {
              let newDoc = oldDoc
              return newDoc
            }
          }
        }
      })
    }
    await this.db.collection({ name: 'ws_items', schema: wsSchemaItem, migrationStrategies: migrationProxy({}) })
    await this.db.collection({ name: 'ws_changes', schema: wsSchemaLocalChanges })
    // обработка события измения мастерской пользователем (запоминает измененные элементы)
    let onWsChangedByUser = async (id, operation) => {
      const f = onWsChangedByUser
      if (this.synchronizeWsWholeInProgress || !rxdb.isLeader()) return
      assert(id && operation && operation in WsOperationEnum, 'bad params' + id + operation)
      await this.db.ws_changes.atomicUpsert({ id, operation })
      logD(f, `complete. ${id}`)
    }
    this.db.ws_items.postInsert(async (plainData) => {
      await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT)
    }, false)
    this.db.ws_items.postSave(async (plainData) => {
      await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT)
    }, false)
    this.db.ws_items.postRemove(async (plainData) => {
      await onWsChangedByUser(plainData.id, WsOperationEnum.DELETE)
    }, false)
  }

  // удалить все данные из мастерской
  async clearCollections () {
    const f = this.clearCollections
    logD(f, 'start')
    if (this.db.ws_items) {
      await this.db.ws_items.remove()
    }
    if (this.db.ws_changes) {
      await this.db.ws_changes.remove()
    }
    await this.createCollections()
    logD(f, 'complete')
  }

  async create (recursive = false) {
    const f = this.create
    assert(!this.created, 'this.created')
    try {
      this.synchroLoopWaitObj = new WaitBreakable(synchroTimeMin)
      this.mutex = new Mutex()
      await this.createCollections()
      this.created = true
    } catch (err) {
      logE(f, 'ошибка при создания Workspace! очищаем и пересоздаем!', err)
      await this.clearCollections()
      if (!recursive) await this.create(true)
    }
  }

  switchOnSynchro (reactiveUser) { // для гостей мастерская НЕ синхронится с сервером!
    const f = this.switchOnSynchro
    assert(reactiveUser, '!reactiveUser')
    assert(reactiveUser.wsRevision >= 0, '!reactiveUser.wsRevision')
    this.reactiveUser = reactiveUser
    // синхроним изменения в цикле
    let synchroLoop = async () => {
      const f = synchroLoop
      while (this.reactiveUser) {
        logD(f, 'next loop...', this.synchroLoopWaitObj.getTimeOut())
        try {
          await this.mutex.lock()
          if (rxdb.isLeader()) await this.synchronize()
        } catch (err) {
          logE(f, 'не удалось синхронизировать мастерскую с сервером', err)
          this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeMin * 10))
        } finally {
          this.mutex.release()
        }
        await this.synchroLoopWaitObj.wait()
      }
    }
    synchroLoop().catch(err => logE(f, 'не удалось запустить цикл синхронизации', err))
  }

  switchOffSynchro () {
    delete this.reactiveUser
  }

  async synchronize () {
    const f = this.synchronize
    assert(rxdb.isLeader(), '!isLeader')
    // запросит при необходимости данные и сольет с локальными изменениями
    const synchronizeWsWhole = async (forceMerge = false) => {
      const f = synchronizeWsWhole
      assert(this.reactiveUser && this.reactiveUser.wsRevision >= 0, '!wsRevision')

      try {
        this.synchronizeWsWholeInProgress = true
        let wsRevisionLocalDoc = await rxdb.getNoLock(RxCollectionEnum.META, 'wsRevision')
        let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc) : -1
        if (forceMerge || wsRevisionLocal !== this.reactiveUser.wsRevision) { // ревизия мастерской на сервере отличается (this.reactiveUser.wsRevision меняется в processEvent)
          let wsServer = await WorkspaceApi.getWs()
          for (let wsItemTypeEnum in WsItemTypeEnum) {
            logD(f, `try merge collection: ${wsItemTypeEnum}`)
            let itemsServer = wsServer[wsItemTypeEnum] || []
            let serverIds = new Set(itemsServer.map(item => item.id))
            // смотрим что есть на сервере
            for (let itemServer of itemsServer) {
              let itemLocalDoc = await this.db.ws_items.findOne(itemServer.id).exec()
              if (!itemLocalDoc || itemServer.rev !== itemLocalDoc.rev || itemsServer.updatedAt > itemLocalDoc.updatedAt) { // берем с сервера, то, чего у нас нет, либо что у нас устарело
                logD(f, 'принимаем версию сервера.', itemServer, itemLocalDoc)
                itemLocalDoc = await this.db.ws_items.atomicUpsert(itemServer)
                await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
              }
            }
            // смотрим что есть у нас
            for (let itemLocalDoc of await this.db.ws_items.find({selector: {wsItemType: wsItemTypeEnum}}).exec()) {
              if (!serverIds.has(itemLocalDoc.id)) { // есть у нас, но нет на сервере
                let unsavedChanges = await this.db.ws_changes.findOne(itemLocalDoc.id).exec()
                if (!unsavedChanges) { // есть у нас и мы ничего не меняли c момента последнего сохранения
                  logD(f, 'удаляем item', itemLocalDoc)
                  await itemLocalDoc.remove()
                  await this.db.ws_changes.find({ selector: { id: itemLocalDoc.id } }).remove() // см onCollectionUpdate
                }
              }
            }
          }
          await rxdb.setNoLock(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsServer.rev.toString() })
          this.reactiveUser.wsRevision = wsServer.rev // версия по мнению сервера
          logD(f, 'pull ws complete')
        }
      } finally {
        this.synchronizeWsWholeInProgress = false
      }
    }
    // отправить изменения на сервер
    const saveToServer = async (wsOperationEnum, item) => {
      const f = saveToServer
      assert(item, '!item')
      logD(f, `start ${item.id} rev:${item.rev}`)
      assert(rxdb.isLeader(), '!this.isLeader')
      assert(this.created, '!this.created')
      assert(item && item.id, '!item')
      assert(wsOperationEnum in WsOperationEnum, 'bad operation' + wsOperationEnum)
      let wsItemUpsert, wsItemDelete
      if (wsOperationEnum === WsOperationEnum.UPSERT) {
        wsItemUpsert = await WorkspaceApi.wsItemUpsert(item)
      } else {
        wsItemDelete = await WorkspaceApi.wsItemDelete(item)
      }
      logD(f, 'complete')
      return { wsItemUpsert, wsItemDelete }
    }

    // заполняем с сервера (если еще не заполено)
    await synchronizeWsWhole()
    let unsavedItems = await this.db.ws_changes.find().exec()
    for (let rxDocUnsavedItem of unsavedItems) {
      let { id, operation, updatedAt } = rxDocUnsavedItem
      let plainDoc
      if (operation === WsOperationEnum.DELETE) {
        plainDoc = { id, wsItemType: getRxCollectionEnumFromId(id) }
      } else {
        let rxDoc = await this.db.ws_items.findOne(id).exec()
        if (!rxDoc) { // в мастерской нет такого элемента!
          await this.db.ws_changes.find({ selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
          continue
        }
        plainDoc = rxDoc.toJSON()
      }
      try {
        // сначала удаляем из очереди, а потом шлем на отправку (processEvent сработает быстрее, чем закончится saveToServer)
        await this.db.ws_changes.find({ selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
        await saveToServer(operation, plainDoc)
        this.synchroLoopWaitObj.setTimeout(synchroTimeMin)
      } catch (err) {
        if (err.networkError) { // если ошибка не сетевая - увеличить интервал
          logD(f, 'неудачная попытка отправить данные на сервер. проблемы сети. попоробуем позже...', err)
          this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeMin * 10))
          await this.db.ws_changes.upsert(rxDocUnsavedItem.toJSON()) // вставляем обратно
        } else {
          try {
            logE(f, 'критическая ошибка при отправке! пробуем слиться с сервером', err)
            await synchronizeWsWhole(true)
            this.synchroLoopWaitObj.setTimeout(synchroTimeMin)
          } catch (err) {
            logE(f, 'неудачная синхронизация  с сервером', err)
            if (err.networkError) {
              this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeMin * 10))
              await this.db.ws_changes.upsert(rxDocUnsavedItem.toJSON()) // вставляем обратно
            }
          }
        }
      }
    }
  }

  // от сервера прилетел эвент об изменении в мастерской (скорей всего - ответ на наши действия)
  async processEvent (event) {
    assert(rxdb.isLeader(), 'rxdb.isLeader()')
    try {
      await this.mutex.lock()
      const f = this.processEvent
      logD(f, 'start')
      if (!rxdb.isLeader()) return
      let { type, wsItem: itemServer, wsRevision } = event
      assert(this.created, '!this.created')
      assert(this.reactiveUser, '!this.reactiveUser') // почему я получил этот эвент, если я гость???
      assert(itemServer.id && itemServer.rev, 'assert itemServer !check')
      assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')

      let wsRevisionLocalDoc = await rxdb.getNoLock(RxCollectionEnum.META, 'wsRevision')
      let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc) : 0 // версия локальной мастерской
      this.reactiveUser.wsRevision = wsRevision // версия мастерской по мнению сервера
      if (wsRevisionLocal + 1 !== wsRevision) {
        logW(f, `WS expired! wsRevisionLocal=${wsRevisionLocal} wsRevisionServer=${wsRevision}`)
        // здесь нельзя явно вызывать synchronizeWsWhole (только в рамках synchronize, тк оно работает параллельно)
        this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
        return
      }
      // ищем изменившейся item
      const rxDoc = await this.db.ws_items.findOne(itemServer.id).exec()
      // применим изменения
      if (!rxDoc || rxDoc.rev + 1 < itemServer.rev || rxDoc.updatedAt < itemServer.updatedAt) {
        logD(f, 'Берем изменения с сервера')
        if (type !== 'WS_ITEM_DELETED') {
          // delete itemServer._rev // иначе - постоянные конфликты внутри pouchdb
          await this.db.ws_items.atomicUpsert(itemServer)
        } else {
          await this.db.ws_items.find({ selector: { id: itemServer.id } }).remove()
        }
        await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
      } else {
        let hasChanges = await this.db.ws_changes.findOne(itemServer.id).exec() // есть локальные изменения
        // просто возьмем ревизию с сервера
        await rxDoc.atomicUpdate((oldData) => {
          oldData.rev = itemServer.rev // ревизию назначает сервер
          oldData.oid = itemServer.oid // oid генерируется на сервере
          return oldData
        })
        // atomicSet мог добавить этот item в ws_changes! Приводим в исходное (см onCollectionUpdate)
        if (!hasChanges) { // если до atomicSet изменений не было - удаляем
          await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove()
        }
        logD(f, `event проигнорирован (у нас самая актуальная версия) ${rxDoc.id} rev: ${rxDoc.rev}`)
      }
      // все пришедшие изменения применены. Актуализируем версию локальной мастерской (см synchronizeWsWhole)
      await rxdb.setNoLock(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsRevision.toString() })
      logD(f, 'complete')
    } finally {
      this.mutex.release()
    }
  }

  getWsCollectionEnumByItem (item) {
    assert(item && (item.id || item.wsItemType), 'bad item!' + JSON.stringify(item))
    if (item.wsItemType) return item.wsItemType
    let rxCollectionEnum = getRxCollectionEnumFromId(item.id)
    assert(rxCollectionEnum in WsCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
    return rxCollectionEnum
  }

  async set (item, withLock = true) {
    try {
      if (withLock) await this.mutex.lock()
      const f = this.set
      assert(this.created, '!this.created')
      let itemCopy = JSON.parse(JSON.stringify(item))
      logD(f, `start. item ${item.id}, ${item.rev}`)
      assert(itemCopy.wsItemType in WsItemTypeEnum, 'bad wsItemType:' + itemCopy.g)
      itemCopy.updatedAt = Date.now()
      if (!itemCopy.createdAt) itemCopy.createdAt = Date.now()
      if (!itemCopy.id) itemCopy.id = `${itemCopy.wsItemType}::${Date.now()}` // генерируем id для нового элемента
      let rxDoc = await this.db.ws_items.atomicUpsert(itemCopy)
      assert(isRxDocument(rxDoc), '!isRxDocument' + JSON.stringify(rxDoc))
      logD(f, 'complete')
      return rxDoc
    } finally {
      if (withLock) this.mutex.release()
    }
  }

  async find (mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in WsCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    delete mangoQuery.selector.rxCollectionEnum
    mangoQuery.selector.wsItemType = rxCollectionEnum
    let rxQuery = this.db.ws_items.find(mangoQuery)
    return rxQuery
  }

  async get (id) {
    let rxDoc = await this.db.ws_items.findOne(id).exec()
    return rxDoc
  }

  async remove (id) {
    try {
      await this.mutex.lock()
      assert(this.created, '!this.created')
      await this.db.ws_items.find({ selector: { id: id } }).remove()
    } finally {
      this.mutex.release()
    }
  }

  async lock () {
    await this.mutex.lock()
  }

  release () {
    this.mutex.release()
  }
}

export { Workspace, WsCollectionEnum, WsItemTypeEnum }
