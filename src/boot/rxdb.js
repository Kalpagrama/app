import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache, ObjectQueries } from 'src/system/rxdb/cache'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

const RxCollectionEnum = Object.freeze({
  ...WsCollectionEnum,
  SPHERE_NODES: 'SPHERE_NODES',
  NODE_NODES: 'NODE_NODES',
  SPHERE_SPHERES: 'SPHERE_SPHERES'
})
const RxModuleEnum = Object.freeze({
  WS: 'WS',
  SETTINGS: 'SETTINGS',
  CACHE: 'CACHE'
})

let rxdbProxy
let rxdbWrapper

class RxDBWrapper {
  async create () {
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.cache = new Cache()
    await this.cache.create()
    this.objectQueries = new ObjectQueries(this.cache)
    this.workspace = new Workspace()
    await this.workspace.create()
    this.created = true
  }

  // вызывать после логина
  async init (userOid) {
    logD('init RXDB')
    assert(this.created, '!created')
    let {rxDoc: rxDocUser, reactiveItem} = await this.objectQueries.findOne(userOid)
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
    switch (event.type) {
      case 'WS_ITEM_CREATED':
      case 'WS_ITEM_DELETED':
      case 'WS_ITEM_UPDATED':
        return await this.workspace.processEvent(event)
      default:
        throw new Error('bad event' + event.type)
    }
  }

  // определит по итему - откуда он и вставит в нужную коллекцию
  async upsertItem (item, withLock = true) {
    if (item.wsItemType && item.wsItemType in WsItemTypeEnum){
      let { rxDoc, reactiveItem } = await this.workspace.upsertItem(item, withLock)
      return reactiveItem
    }
  }

  async deleteItem (id) {
    let keyParts = id.split('::')
    assert(keyParts.length === 2, 'bad id' + id)
    let collection = keyParts[0]
    if (collection in WsCollectionEnum){
      return await this.workspace.deleteItem(id)
    } else throw new Error('bad id!!' + id)
  }

  async find (rxCollectionEnum, mangoQuery) {
    if (rxCollectionEnum in WsCollectionEnum){
      let {rxQuery, reactiveList} = await this.workspace.find(rxCollectionEnum, mangoQuery)
      return reactiveList
    } else {
      switch (rxCollectionEnum) {
        case RxCollectionEnum.SPHERE_NODES: break
        case RxCollectionEnum.SPHERE_SPHERES: break
        case RxCollectionEnum.NODE_NODES: break
      }
    }
  }

  async findByOid (oid, priority) {
    let {rxDoc, reactiveItem} = await this.objectQueries.findOneQueue(oid, priority)
    return reactiveItem
  }

  currentUser(){
    let f = this.currentUser
    logD(f, 'reactiveUser=', this.reactiveUser)
    return this.reactiveUser
  }
}

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    rxdbWrapper = new RxDBWrapper()
    await rxdbWrapper.create()
    // делаем геттеры (чтобы можно было писать так: Vue.prototype.$rxdb.wsNode.find(...).where(...).exec())
    // rxdbProxy = new Proxy(rxdbWrapper, {
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
    Vue.prototype.$rxdb = rxdbWrapper // rxdbProxy
  } catch (err) {
    logE(err)
  }
}
export { rxdbWrapper as rxdb, RxCollectionEnum }
