import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache, CacheItemTypeEnum } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'
import { Event } from 'src/system/rxdb/event'

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { Lists } from 'src/system/rxdb/lists'
import { ReactiveItemHolder } from 'src/system/rxdb/reactive'
import { ListsApi as ListApi } from 'src/api/lists'
import { NodeApi } from 'src/api/node'
import { ObjectsApi } from 'src/api/objects'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

const RxCollectionEnum = Object.freeze({
  ...WsCollectionEnum,
  LST_SPHERE_NODES: 'LST_SPHERE_NODES',
  LST_NODE_NODES: 'LST_NODE_NODES',
  LST_CONTENT_NODES: 'LST_CONTENT_NODES',
  LST_SPHERE_SPHERES: 'LST_SPHERE_SPHERES',
  LST_FEED: 'LST_FEED'
})
const RxModuleEnum = Object.freeze({
  WS: 'WS',
  SETTINGS: 'SETTINGS',
  CACHE: 'CACHE'
})

class RxDBWrapper {
  async create () {
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.workspace = new Workspace()
    await this.workspace.create()
    this.cache = new Cache()
    await this.cache.create()
    this.objects = new Objects(this.cache)
    this.lists = new Lists(this.cache)
    this.event = new Event(this.workspace, this.objects, this.lists)

    this.created = true
  }

  // вызывать после логина
  async init (userOid) {
    logD('init RXDB')
    assert(this.created, '!created')
    await this.event.init()
    // запрашиваем необходимые для работы данные (currentUser, nodeCategories, etc)
    let fetchCurrentUserFunc = async () => {
      return {
        notEvict: true, // живет вечно
        type: CacheItemTypeEnum.OBJ,
        item: await ObjectsApi.objectFull(userOid),
        actualAge: 'day'
      }
    }
    let currentUser = await this.get(userOid, fetchCurrentUserFunc)
    let fetchCategoriesFunc = async () => {
      return {
        notEvict: true, // живет вечно
        type: CacheItemTypeEnum.OTHER,
        item: await NodeApi.nodeCategories(),
        actualAge: 'day'
      }
    }
    let nodeCategories = await this.get('nodeCategories', fetchCategoriesFunc)
    logD('currentUser=', currentUser)
    logD('nodeCategories=', nodeCategories)
    if (currentUser) { // синхронизация мастерской с сервером
      this.workspace.switchOnSynchro(currentUser)
    }
  }

  async clearAll () {
    for (let module in RxModuleEnum) await this.clearModule(module)
  }

  async clearModule (rxModuleEnum) {
    assert(rxModuleEnum in RxModuleEnum, 'bad rxModuleEnum')
    switch (rxModuleEnum) {
      case RxModuleEnum.WS:
        this.workspace.switchOffSynchro()
        return await this.workspace.clear()
      case RxModuleEnum.SETTINGS:
        // throw new Error('not impl' + rxModuleEnum)
        return
      case RxModuleEnum.CACHE:
        return await this.cache.clear()
      default:
        throw new Error('bad module' + rxModuleEnum)
    }
  }

  async lock () {
    await this.workspace.lock()
  }

  release () {
    this.workspace.release()
  }

  async processEvent (event) {
    await this.event.processEvent(event)
  }

  // определит по итему - откуда он и вставит в нужную коллекцию
  async upsertItem (item, withLock = true) {
    if (item.wsItemType && item.wsItemType in WsItemTypeEnum) {
      let { rxDoc, reactiveItem } = await this.workspace.upsertItem(item, withLock)
      return reactiveItem
    }
  }

  async deleteItem (id) {
    let keyParts = id.split('::')
    assert(keyParts.length === 2, 'bad id' + id)
    let collection = keyParts[0]
    if (collection in WsCollectionEnum) {
      return await this.workspace.deleteItem(id)
    } else throw new Error('bad id!!' + id)
  }

  async find (mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    if (rxCollectionEnum in WsCollectionEnum) {
      return await this.workspace.find(mangoQuery)
    } else {
      return await this.lists.find(mangoQuery)
    }
  }

  async findByOid (oid, priority) {
    return await this.objects.findOneQueue(oid, priority)
  }

  async get (id, fetchFunc) {
    let rxDoc = await this.cache.get(id, fetchFunc)
    if (!rxDoc) return null
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return reactiveItemHolder.reactiveItem.cached.data
  }

  async set (id, data, actualAge) {
    let rxDoc = await this.cache.set(id, this.cache.getType({data}), data, actualAge, false)
    if (!rxDoc) return null
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return reactiveItemHolder.reactiveItem.cached.data
  }
}

const rxdbWrapper = new RxDBWrapper()

// делаем геттеры (чтобы можно было писать так: Vue.prototype.$rxdb.wsNode.find(...).where(...).exec())
// const rxdbProxy = new Proxy(rxdbWrapper, {
//   get (target, prop) {
//     if (prop in RxCollectionEnum) {
//       return target.getCollection(prop)
//     }
//     let value = target[prop]
//     return (typeof value === 'function') ? value.bind(target) : value // иначе - внутри RxDB this - будет указывать на Proxy
//   },
//   set (target, prop, val) { // запрещаем менять свойства
//     return false
//   },
//   deleteProperty (target, prop) { // запрещаем удаление свойства
//     return false
//   }
// })

export { rxdbWrapper as rxdb, RxModuleEnum, RxCollectionEnum }
