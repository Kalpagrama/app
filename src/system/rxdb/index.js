import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache, CacheItemTypeEnum } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'
import {Event} from 'src/system/rxdb/event'

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { Lists } from 'src/system/rxdb/lists'

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
    let { rxDoc: rxDocUser, reactiveItem } = await this.objects.findOne(userOid)
    this.reactiveUser = reactiveItem
    logD('before switchOnSynchro', this.reactiveUser)
    this.workspace.switchOnSynchro(this.reactiveUser)
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
    let items = []
    if (rxCollectionEnum in WsCollectionEnum) {
      let { rxQuery, reactiveList } = await this.workspace.find(mangoQuery)
      items = reactiveList
    } else {
      let { rxDoc, reactiveList } = await this.lists.find(mangoQuery)
      items = reactiveList
    }
    return { items, count: items.length, totalCount: items.length, nextPageToken: null }
  }

  async findByOid (oid, priority) {
    let { rxDoc, reactiveItem } = await this.objects.findOneQueue(oid, priority)
    return reactiveItem
  }

  async getItem (id, fetchFunc) {
    assert(this.cache.getItemTypeById(id) in CacheItemTypeEnum, 'bad id' + id)
    return await this.cache.getItem(id, fetchFunc)
  }

  async setItem (id, item, actualAge) {
    assert(this.cache.getItemTypeById(id) in CacheItemTypeEnum, 'bad id' + id)
    return await this.cache.setItem(id, item, actualAge)
  }

  currentUser () {
    let f = this.currentUser
    logD(f, 'reactiveUser=', this.reactiveUser)
    assert(this.currentUser, '!this.currentUser')
    return this.reactiveUser
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
