import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'

import assert from 'assert'
import {
  wsSchemaChain,
  wsSchemaContent,
  wsSchemaNode,
  wsSchemaSphere,
  wsSchemaLocalChanges, wsSchemaMeta
} from 'src/system/rxdb/schemas'
import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

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
      await wait(1000)
    }
  }
}

const WsItemTypeEnum = Object.freeze({
  WS_NODE: 'WS_NODE',
  WS_CONTENT: 'WS_CONTENT',
  WS_CHAIN: 'WS_CHAIN',
  WS_SPHERE: 'WS_SPHERE'
})
const WsCollectionEnum = Object.freeze({ ...WsItemTypeEnum })
const WsOperationEnum = Object.freeze({ UPSERT: 'UPSERT', DELETE: 'DELETE' })

class Mutex {
  constructor () {
    this.queue = []
    this.locked = false
  }

  lock () {
    return new Promise((resolve, reject) => {
      if (this.locked) {
        this.queue.push([resolve, reject])
      } else {
        this.locked = true
        resolve()
      }
    })
  }

  release () {
    if (this.queue.length > 0) {
      const [resolve, reject] = this.queue.shift()
      resolve()
    } else {
      this.locked = false
    }
  }
}

// Workspace вызывается 1: из UI(upsertItem/deleteItem); 2: из сети(processEvent); 3: synchroLoop.
// Эти ф-ии сериализованы(вызываются строго друг за другом) (см Mutex)
class Workspace {
  async create (recursive = false) {
    const f = this.create
    logD(f, 'RXDB::WS::create')
    assert(!this.created, 'this.created')
    try {
      this.initialized = false
      this.created = false
      this.isLeader = false
      this.db = await createRxDatabase({
        name: 'ws',
        adapter: 'idb', // <- storage-adapter
        multiInstance: true, // <- multiInstance (optional, default: true)
        eventReduce: true // <- eventReduce (optional, default: true)
      })
      this.db.waitForLeadership().then(() => {
        logD(f, 'RXDB::WS::LEADER!!!!')
        this.isLeader = true
      })
      this.synchroLoopWaitObj = new WaitBreakable(synchroTimeMin)
      this.mutex = new Mutex()
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
      await this.db.collection({ name: 'ws_node', schema: wsSchemaNode, migrationStrategies: migrationProxy({}) })
      await this.db.collection({
        name: 'ws_content',
        schema: wsSchemaContent,
        migrationStrategies: migrationProxy({})
      })
      await this.db.collection({ name: 'ws_chain', schema: wsSchemaChain, migrationStrategies: migrationProxy({}) })
      await this.db.collection({ name: 'ws_sphere', schema: wsSchemaSphere, migrationStrategies: migrationProxy({}) })
      await this.db.collection({
        name: 'ws_meta',
        schema: wsSchemaMeta,
        migrationStrategies: migrationProxy({})
      })
      await this.db.collection({
        name: 'ws_changes',
        schema: wsSchemaLocalChanges,
        migrationStrategies: migrationProxy({})
      })
      this.created = true
    } catch (err) {
      logE(f, 'ошибка при создания Workspace! очищаем и пересоздаем!', err)
      await this.clear()
      if (!recursive) await this.create(true)
    }
  }

  // удалить все данные из мастерской
  async clear () {
    const f = this.clear
    logD(f, 'workspace::clear')
    await removeRxDatabase('ws', 'idb')
    this.created = false
    this.initialized = false
  }

  // synchronize - синхронить мастерскую с сервером
  async init (userDoc, recursive = false) {
    const f = this.init
    logD(f, 'RXDB::WS::init')
    assert(this.created && !this.initialized, 'this.created && !this.initialized')
    try {
      // обработка события измения мастерской (запоминает измененные элементы)
      let pushChangedItems = async (id, operation) => {
        const f = pushChangedItems
        if (!this.isLeader) {
          logD(f, 'cancel')
          return
        }
        assert(id && operation && operation in WsOperationEnum, 'bad params' + id + operation)
        await this.db.ws_changes.atomicUpsert({ id, operation })
        logD(f, 'complete ')
      }
      for (let wsCollectionEnum in WsCollectionEnum) {
        this.getWsCollection(wsCollectionEnum).postInsert(async (plainData) => {
          await pushChangedItems(plainData.id, WsOperationEnum.UPSERT)
        }, false)
        this.getWsCollection(wsCollectionEnum).postSave(async (plainData) => {
          await pushChangedItems(plainData.id, WsOperationEnum.UPSERT)
        }, false)
        this.getWsCollection(wsCollectionEnum).postRemove(async (plainData) => {
          await pushChangedItems(plainData.id, WsOperationEnum.DELETE)
        }, false)
      }
      if (userDoc) { // для гостей мастерская НЕ синхронится с сервером!
        this.userDoc = userDoc
        assert(userDoc.wsRevision >= 0, '!userDoc.wsRevision')
        // синхроним изменения в цикле
        let synchroLoop = async () => {
          const f = synchroLoop
          while (true) {
            logD(f, 'next loop...', this.synchroLoopWaitObj.getTimeOut())
            try {
              await this.mutex.lock()
              if (this.isLeader) await this.synchronize()
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
      this.initialized = true
    } catch (err) {
      logE(f, 'ошибка при инициализации Workspace! очищаем и пересоздаем!', err)
      await this.clear() // удалем все данные
      await this.create() // пересоздаем
      if (!recursive) await this.init(userDoc, true) // переинициализируем
    }
  }

  async synchronize () {
    const f = this.synchronize
    assert(this.isLeader, '!isLeader')
    // запросит при необходимости данные и сольет с локальными изменениями
    const synchronizeWsWhole = async (forceMerge = false) => {
      const f = synchronizeWsWhole
      assert(this.userDoc && this.userDoc.wsRevision >= 0, '!wsRevision')

      let wsRevisionLocalDoc = await this.db.ws_meta.findOne('wsRevision').exec()
      let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc.value) : 0
      if (forceMerge || wsRevisionLocal !== this.userDoc.wsRevision) { // ревизия мастерской на сервере отличается (this.userDoc.wsRevision меняется в processEvent)
        logD(f, 'try get ws from server... ', forceMerge, wsRevisionLocal, this.userDoc.wsRevision)
        let { data: { ws: wsServer } } = await apollo.clients.api.query({
          query: gql`query{ws}`
        })

        for (let wsCollectionEnum in WsCollectionEnum) {
          logD(f, 'try merge: ', wsCollectionEnum)
          let itemsServer = wsServer[wsCollectionEnum] || []
          let wsCollection = this.getWsCollection(wsCollectionEnum)
          let serverIds = new Set(itemsServer.map(item => item.id))
          // смотрим что есть на сервере
          for (let itemServer of itemsServer) {
            let itemLocalDoc = await this.getWsCollection(wsCollectionEnum).findOne(itemServer.id).exec()
            if (!itemLocalDoc || itemServer.rev !== itemLocalDoc.rev || itemsServer.updatedAt > itemLocalDoc.updatedAt) { // берем с сервера, то, чего у нас нет, либо что у нас устарело
              logD(f, 'принимаем версию сервера. itemServer=', itemServer, itemLocalDoc)
              // delete itemServer._rev // иначе - постоянные конфликты внутри pouchdb
              await wsCollection.atomicUpsert(itemServer)
              await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
            }
          }
          // смотрим что есть у нас
          for (let itemLocalDoc of await wsCollection.find().exec()) {
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
        logD('set wsRevision', wsServer.rev.toString())
        await this.db.ws_meta.atomicUpsert({ key: 'wsRevision', value: wsServer.rev.toString() }) // версия по мнению клиента
        await this.userDoc.atomicSet('wsRevision', wsServer.rev) // версия по мнению сервера
        logD(f, 'merge ws with server complete')
      }
    }
    // отправить изменения на сервер
    const saveToServer = async (wsOperationEnum, item) => {
      const f = saveToServer
      logD(f, 'start', item)
      assert(this.initialized, '!this.initialized')
      assert(this.isLeader, '!this.isLeader')
      assert(this.initialized, '!this.initialized')
      assert(item && item.id, '!item')
      assert(wsOperationEnum in WsOperationEnum, 'bad operation' + wsOperationEnum)
      let { data: { wsItemUpsert, wsItemDelete } } = await apollo.clients.api.mutate({
        mutation: wsOperationEnum === WsOperationEnum.UPSERT
          ? gql`mutation wsItemUpsert($item: RawJSON!) {
                  wsItemUpsert (item: $item)
                }`
          : gql`
                  mutation wsItemDelete($item: RawJSON!) {
                    wsItemDelete (item: $item)
                  }`,
        variables: { item }
      })
      logD(f, 'complete')
      return { wsItemUpsert, wsItemDelete }
    }

    // заполняем с сервера (если еще не заполено)
    await synchronizeWsWhole()
    let unsavedItems = await this.db.ws_changes.find().exec()
    for (let rxDocUnsavedItem of unsavedItems) {
      let { id, operation, updatedAt } = rxDocUnsavedItem
      let itemCollection = this.getWsCollectionByItem({ id })
      let rxDoc = await itemCollection.findOne(id).exec()
      logD(f, 'synchronize rxDoc', operation, id, rxDoc)
      let plainDoc = operation === WsOperationEnum.DELETE ? { id } : rxDoc.toJSON()
      assert(plainDoc, 'документ не найден!' + id)
      try {
        // сначала удаляем из очереди, а потом шлем на отправку (processEvent сработает быстрееБ чем закончится saveToServer)
        await this.db.ws_changes.find({ selector: { id: id } }).remove() // удаляем информацию из очереди на отправку
        await saveToServer(operation, plainDoc)
        // todo проверить что действительно удаляется!!!  // await rxDocUnsavedItem.remove()
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
    try {
      await this.mutex.lock()
      const f = this.processEvent
      logD(f, 'start')
      if (!this.isLeader) return
      let { type, wsItem: itemServer, wsRevision } = event
      assert(this.initialized, '!this.initialized')
      assert(this.userDoc, '!this.userDoc') // почему я получил этот эвент, если я гость???
      assert(itemServer.id && itemServer.rev, 'assert itemServer !check')
      assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')

      let wsRevisionLocalDoc = await this.db.ws_meta.findOne('wsRevision').exec()
      let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc.value) : 0 // версия локальной мастерской
      await this.userDoc.atomicSet('wsRevision', wsRevision) // версия мастерской по мнению сервера
      if (wsRevisionLocal + 1 !== wsRevision) {
        logW(f, `WS expired! wsRevisionLocal=${wsRevisionLocal} wsRevisionServer=${wsRevision}`)
        // здесь нельзя явно вызывать synchronizeWsWhole (только в рамках synchronize, тк оно работает параллельно)
        this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
        return
      }
      // ищем изменившейся item
      const rxDoc = await this.getWsCollectionByItem(itemServer).findOne(itemServer.id).exec()
      // применим изменения
      if (!rxDoc || rxDoc.rev + 1 < itemServer.rev || rxDoc.updatedAt < itemServer.updatedAt) {
        logD(f, 'Берем изменения с сервера', itemServer)
        if (type !== 'WS_ITEM_DELETED') {
          // delete itemServer._rev // иначе - постоянные конфликты внутри pouchdb
          await this.getWsCollectionByItem(itemServer).atomicUpsert(itemServer)
        } else {
          await this.getWsCollectionByItem(itemServer).find({ selector: { id: itemServer.id } }).remove()
        }
        await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
      } else {
        let hasChanges = await this.db.ws_changes.findOne(itemServer.id).exec() // есть локальные изменения
        logD(f, 'event проигнорирован (у нас самая актуальная версия)', hasChanges)
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
      }
      // все пришедшие изменения применены. Актуализируем версию локальной мастерской (см synchronizeWsWhole)
      await this.db.ws_meta.atomicUpsert({ key: 'wsRevision', value: wsRevision.toString() }) // версия по мнению клиента
      logD(f, 'complete')
    } finally {
      this.mutex.release()
    }
  }

  getWsCollection (wsCollectionEnum) {
    assert(wsCollectionEnum in WsCollectionEnum, 'bad wsCollection' + wsCollectionEnum)
    switch (wsCollectionEnum) {
      case WsCollectionEnum.WS_NODE:
        return this.db.ws_node
      case WsCollectionEnum.WS_CONTENT:
        return this.db.ws_content
      case WsCollectionEnum.WS_CHAIN:
        return this.db.ws_chain
      case WsCollectionEnum.WS_SPHERE:
        return this.db.ws_sphere
      default:
        throw new Error('bad collection' + wsCollectionEnum)
    }
  }

  getWsCollectionByItem (item) {
    let wsCollectionEnum = this.getWsCollectionEnumByItem(item)
    return this.getWsCollection(wsCollectionEnum)
  }

  getWsCollectionEnumByItem (item) {
    assert(item && (item.id || item.wsItemType), 'bad item!' + JSON.stringify(item))
    if (item.wsItemType) return item.wsItemType
    let keyParts = item.id.split('::')
    assert(keyParts.length === 2 && keyParts[0] in WsCollectionEnum, 'bad id' + item.id)
    return keyParts[0]
  }

  async upsertItem (item) {
    try {
      await this.mutex.lock()
      const f = this.upsertItem
      assert(this.initialized, '!this.initialized')
      let itemCopy = JSON.parse(JSON.stringify(item))
      logD(f, 'start', itemCopy)
      assert(itemCopy.wsItemType in WsItemTypeEnum, 'bad wsItemType:' + itemCopy.g)
      itemCopy.updatedAt = Date.now()
      if (!itemCopy.createdAt) itemCopy.createdAt = Date.now()
      if (!itemCopy.id) itemCopy.id = `${itemCopy.wsItemType}::${Date.now()}` // генерируем id для нового элемента
      let doc = await this.getWsCollectionByItem(itemCopy).atomicUpsert(itemCopy)
      assert(isRxDocument(doc), '!isRxDocument' + JSON.stringify(doc))
      logD(f, 'complete')
      return doc
    } finally {
      this.mutex.release()
    }
  }

  async deleteItem (id) {
    try {
      await this.mutex.lock()
      assert(this.initialized, '!this.initialized')
      await this.getWsCollectionByItem({ id }).find({ selector: { id: id } }).remove()
    } finally {
      this.mutex.release()
    }
  }
}

export { Workspace, WsCollectionEnum, Mutex }
