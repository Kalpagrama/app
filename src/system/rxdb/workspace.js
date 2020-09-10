import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'

import assert from 'assert'
import { wsSchemaLocalChanges, wsSchemaItem } from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { getReactive, Mutex, updateRxDoc } from 'src/system/rxdb/reactive'
import { WorkspaceApi } from 'src/api/workspace'
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import intersectionWith from 'lodash/intersectionWith'
import { getRxCollectionEnumFromId, RxCollectionEnum, rxdb, getRawIdFromId } from 'src/system/rxdb/index'
import { wait } from 'src/system/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_WS)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_WS)

const synchroTimeMin = 1000 * 60 * 1 // раз в 1 минут шлем изменения на сервер
class WaitBreakable {
  constructor (ms) {
    assert(ms >= synchroTimeMin, 'bad ms')
    this.timeout = ms
  }

  break () {
    logD('форсированная синхронизация мастерской... ')
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
  WS_ANY: 'WS_ANY',
  WS_NODE: 'WS_NODE',
  WS_CONTENT: 'WS_CONTENT',
  WS_CHAIN: 'WS_CHAIN',
  WS_SPHERE: 'WS_SPHERE',
  WS_BOOKMARK: 'WS_BOOKMARK',
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
    const f = this.createCollections
    logD(f, 'start')
    const t1 = performance.now()
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
      if (this.ignoreWsChanges || !rxdb.isLeader()) return
      assert(id && operation && operation in WsOperationEnum, 'bad params' + id + operation)
      await this.db.ws_changes.atomicUpsert({ id, operation })
      // logD(f, `complete. ${id}`)
    }
    this.db.ws_items.preSave(async (plainData, rxDoc) => {
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
    this.db.ws_items.postSave(async (plainData, rxDoc) => {
      // logD(f, `postSave rxDoc:${rxDoc.toJSON().ignoreChanges} plainData:${plainData.ignoreChanges}`, rxDoc.toJSON(), plainData)
      if (!plainData.ignoreChanges) {
        await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT)
      }
    }, false)
    this.db.ws_items.postInsert(async (plainData) => {
      await onWsChangedByUser(plainData.id, WsOperationEnum.UPSERT)
    }, false)
    this.db.ws_items.postRemove(async (plainData) => {
      await onWsChangedByUser(plainData.id, WsOperationEnum.DELETE)
      rxdb.onRxDocDelete(plainData.id)
    }, false)
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  }

  // удалить все данные из мастерской
  async clearCollections () {
    const f = this.clearCollections
    logD(f, 'start')
    const t1 = performance.now()
    // assert(!this.ignoreWsChanges, 'ignoreWsChanges === true')
    while (this.ignoreWsChanges) { // подождем пока отработают synchronize и processEvent
      await wait(100)
    }
    try {
      await this.lock()
      this.ignoreWsChanges = true
      if (this.db.ws_items) {
        await this.db.ws_items.remove()
      }
      if (this.db.ws_changes) {
        await this.db.ws_changes.remove()
      }
      await this.createCollections()
    } finally {
      this.ignoreWsChanges = false
      this.release()
    }
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
      if (recursive) throw err
      logE(f, 'ошибка при создания Workspace! очищаем и пересоздаем!', err)
      await this.clearCollections()
      await this.create(true)
    }
  }

  switchOnSynchro (reactiveUser) { // для гостей мастерская НЕ синхронится с сервером!
    const f = this.switchOnSynchro
    assert(reactiveUser, '!reactiveUser')
    // reactiveUser.wsRevision - версия мастерской по мнению сервера
    assert(reactiveUser.wsRevision >= 0, '!reactiveUser.wsRevision')
    this.reactiveUser = reactiveUser
    // синхроним изменения в цикле
    let synchroLoop = async () => {
      const f = synchroLoop
      while (this.reactiveUser) {
        logD(f, 'next loop...', this.synchroLoopWaitObj.getTimeOut())
        try {
          await this.lock()
          logD(f, 'locked')
          if (rxdb.isLeader()) await this.synchronize()
        } catch (err) {
          logE(f, 'не удалось синхронизировать мастерскую с сервером', err)
          this.synchroLoopWaitObj.setTimeout(Math.min(this.synchroLoopWaitObj.getTimeOut() * 2, synchroTimeMin * 10))
        } finally {
          this.release()
          logD(f, 'unlocked')
        }
        logD(f, 'next loop complete')
        await this.synchroLoopWaitObj.wait()
      }
    }
    synchroLoop().catch(err => logE(f, 'не удалось запустить цикл синхронизации', err))
  }

  switchOffSynchro () {
    delete this.reactiveUser
  }

  // запускается по мере необходимости см ( switchOnSynchro )
  async synchronize () {
    const f = this.synchronize
    logD(f, 'start')
    const t1 = performance.now()
    assert(rxdb.isLeader(), '!isLeader')
    // запросит при необходимости данные и сольет с локальными изменениями
    const synchronizeWsWhole = async (forceMerge = false) => {
      const f = synchronizeWsWhole
      logD(f, 'start')
      const t1 = performance.now()
      assert(this.reactiveUser && this.reactiveUser.wsRevision >= 0, '!wsRevision')

      try {
        this.ignoreWsChanges = true
        let wsRevisionLocalDoc = await rxdb.get(RxCollectionEnum.META, 'wsRevision')
        let wsFetchDate = await rxdb.get(RxCollectionEnum.META, 'wsFetchDate')
        let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc) : -1
        //  reactiveUser.wsRevision - версия мастерской по мнению сервера (меняется в processEvent и при первой загрузке приложения)
        if (forceMerge || wsRevisionLocal !== this.reactiveUser.wsRevision || !wsFetchDate) {
          let wsServer = await WorkspaceApi.getWs()
          logD(f, 'try merge ws...', wsServer)
          // console.time('tm merge ws')
          let itemsServer = []
          for (let wsItemTypeEnum in WsItemTypeEnum) {
            if (wsServer[wsItemTypeEnum])itemsServer.push(...wsServer[wsItemTypeEnum])
          }
          let itemsLocal = await this.db.ws_items.find().exec()
          let unsavedIds = new Set((await this.db.ws_changes.find().exec()).map(item => item.id))

          // есть на сервере, но нет у нас (эти надо вставить!)
          let newItems = differenceWith(itemsServer, itemsLocal, (serverItem, localItem) => {
            return serverItem.id === localItem.id
          })
          // есть и на сервере и у нас, но у нас - устаревшая копия
          let outdatedItems = intersectionWith(itemsServer, itemsLocal, (serverItem, localItem) => {
            return serverItem.id === localItem.id && (serverItem.rev !== localItem.rev || serverItem.updatedAt > localItem.updatedAt)
          })
          // есть у нас, но нет на сервере. (надо удалить у нас)
          let extraItems = differenceWith(itemsLocal, itemsServer, (localItem, serverItem) => {
            return serverItem.id === localItem.id
          }).filter(item => !unsavedIds.has(item.id)) // только те, что НЕ были изменены c момента последнего сохранения
          // logD(f, 'merge ws.(newItems, outdatedItems, extraItems):', newItems, outdatedItems, extraItems)
          await this.db.ws_items.bulkInsert(newItems)
          for (let outdated of outdatedItems) await this.db.ws_items.atomicUpsert(outdated)
          await this.db.ws_items.find({ selector: { id: { $in: extraItems.map(item => item.id) } } }).remove() // удаялем те, которых нет на сервере
          await rxdb.set(RxCollectionEnum.META, { id: 'wsFetchDate', valueString: (new Date()).toISOString() })
          await rxdb.set(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsServer.rev.toString() })
          this.reactiveUser.wsRevision = wsServer.rev // версия по мнению сервера
          logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
        }
      } finally {
        this.ignoreWsChanges = false
      }
    }
    // отправить изменения на сервер
    const saveToServer = async (wsOperationEnum, item, wsRevision) => {
      const f = saveToServer
      assert(wsRevision)
      assert(item, '!item')
      logD(f, `start ${item.id} rev:${item.rev}`)
      const t1 = performance.now()
      assert(rxdb.isLeader(), '!this.isLeader')
      assert(this.created, '!this.created')
      assert(item && item.id, '!item')
      assert(wsOperationEnum in WsOperationEnum, 'bad operation' + wsOperationEnum)
      let wsItemUpsert, wsItemDelete
      if (wsOperationEnum === WsOperationEnum.UPSERT) {
        wsItemUpsert = await WorkspaceApi.wsItemUpsert(item, wsRevision)
      } else {
        wsItemDelete = await WorkspaceApi.wsItemDelete(item, wsRevision)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return { wsItemUpsert, wsItemDelete }
    }

    // заполняем с сервера (если еще не заполено)
    await synchronizeWsWhole()
    let unsavedItems = await this.db.ws_changes.find().exec()
    let wsRevision = this.reactiveUser.wsRevision
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
        await saveToServer(operation, plainDoc, wsRevision++)
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
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  }

  // от сервера прилетел эвент об изменении в мастерской (скорей всего - ответ на наши действия)
  async processEvent (event) {
    assert(rxdb.isLeader(), 'rxdb.isLeader()')
    const f = this.processEvent
    logD(f, 'start')
    const t1 = performance.now()
    try {
      await this.lock()
      logD(f, 'locked')
      this.ignoreWsChanges = true
      if (!rxdb.isLeader()) return
      let { type, wsItem: itemServer, wsRevision } = event
      assert(this.created, '!this.created')
      assert(this.reactiveUser, '!this.reactiveUser') // почему я получил этот эвент, если я гость???
      assert(itemServer.id && itemServer.rev, 'assert itemServer !check')
      assert(type === 'WS_ITEM_CREATED' || type === 'WS_ITEM_DELETED' || type === 'WS_ITEM_UPDATED', 'bad ev type')
      let wsRevisionLocalDoc = await rxdb.get(RxCollectionEnum.META, 'wsRevision')
      let wsRevisionLocal = wsRevisionLocalDoc ? parseInt(wsRevisionLocalDoc) : 0 // версия локальной мастерской
      this.reactiveUser.wsRevision = wsRevision // версия мастерской по мнению сервера
      if (wsRevisionLocal + 1 !== wsRevision) { // мы пропустили некоторые изменения
        logW(f, `WS expired! wsRevisionLocal=${wsRevisionLocal} wsRevisionServer=${wsRevision}`)
        // здесь нельзя явно вызывать synchronizeWsWhole (только в рамках synchronize, тк оно работает параллельно)
        this.synchroLoopWaitObj.break()// форсировать синхронизацию (см synchroLoop)
        return
      }
      // ищем изменившейся item
      assert(itemServer.wsItemType in RxCollectionEnum, 'itemServer.wsItemType in RxCollectionEnum)')
      let reactiveItem = await rxdb.get(null, null, {id: itemServer.id})
      // применим изменения
      if (!reactiveItem || type === 'WS_ITEM_DELETED' || reactiveItem.rev + 1 < itemServer.rev || reactiveItem.updatedAt < itemServer.updatedAt) {
        logD(f, 'Берем изменения с сервера', type)
        if (type === 'WS_ITEM_DELETED') {
          // logD('try remove ws item', await this.db.ws_items.find({ selector: { id: itemServer.id } }).exec())
          await this.db.ws_items.find({ selector: { id: itemServer.id } }).remove()
        } else {
          // logD(f, 'try update ws item')
          await this.db.ws_items.atomicUpsert(itemServer)
        }
        await this.db.ws_changes.find({ selector: { id: itemServer.id } }).remove() // см onCollectionUpdate
      } else {
        logD(f, `event проигнорирован (у нас актуальная версия) ${reactiveItem.id} rev: ${reactiveItem.rev}`)
        // просто возьмем ревизию с сервера
        await reactiveItem.updateExtended('rev', itemServer.rev, false)// ревизию назначает сервер. это изменение не попадает в ws_changes (см. this.db.ws_items.preSave)
      }
      // все пришедшие изменения применены. Актуализируем версию локальной мастерской (см synchronizeWsWhole)
      await rxdb.set(RxCollectionEnum.META, { id: 'wsRevision', valueString: wsRevision.toString() })
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
    } finally {
      this.ignoreWsChanges = false
      this.release()
      logD(f, 'unlocked')
    }
  }

  async find (mangoQuery) {
    const f = this.find
    try {
      await this.lock()
      logD(f, 'locked')
      assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 2' + JSON.stringify(mangoQuery))
      let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
      assert(rxCollectionEnum in WsCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      delete mangoQuery.selector.rxCollectionEnum
      if (rxCollectionEnum !== WsCollectionEnum.WS_ANY) mangoQuery.selector.wsItemType = rxCollectionEnum
      let rxQuery = this.db.ws_items.find(mangoQuery)
      return rxQuery
    } finally {
      this.release()
      logD(f, 'unlocked')
    }
  }

  async set (item) {
    const f = this.set
    logD(f, 'start')
    const t1 = performance.now()
    try {
      await this.lock()
      logD(f, 'locked')
      assert(this.created, '!this.created')
      let itemCopy = JSON.parse(JSON.stringify(item))
      if (itemCopy.wsItemType === 'WS_NODE') {
        itemCopy.contentOids = itemCopy.items.reduce((acc, val) => {
          val.layers.map(l => {
            acc.push(l.contentOid)
          })
          return acc
        }, [])
        // if (itemCopy.stage === 'draft') {
        //   itemCopy.thumbUrl
        // }
      }
      assert(itemCopy.wsItemType in WsItemTypeEnum, 'bad wsItemType:' + itemCopy.g)
      itemCopy.updatedAt = Date.now()
      if (!itemCopy.createdAt) itemCopy.createdAt = Date.now()
      if (!itemCopy.id) itemCopy.id = `${itemCopy.wsItemType}::${Date.now()}` // генерируем id для нового элемента
      // const queryXxx = this.db.ws_items.find()
      // const queryRes = await queryXxx.exec()
      // logD(f, 'before upsert. query_res.length', queryRes.length)
      let rxDoc = await this.db.ws_items.atomicUpsert(itemCopy)
      assert(isRxDocument(rxDoc), '!isRxDocument' + JSON.stringify(rxDoc))
      // const queryXxx2 = this.db.ws_items.find()
      // const queryRes2 = await queryXxx2.exec()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
    } finally {
      this.release()
      logD(f, 'unlocked')
    }
  }

  async get (id) {
    const f = this.get
    logD(f, 'start', id)
    const t1 = performance.now()
    try {
      // await this.lock() вызывается внутри processEvent
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
    try {
      await this.lock()
      logD(f, 'locked')
      assert(this.created, '!this.created')
      await this.db.ws_items.find({ selector: { id: id } }).remove()
    } finally {
      this.release()
      logD(f, 'unlocked')
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
