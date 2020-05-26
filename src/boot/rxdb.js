import assert from 'assert'
import { Workspace, WsCollectionEnum } from 'src/system/rxdb/workspace'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { ReactiveItemHolder, ReactiveListHolder } from 'src/system/rxdb/reactive'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

const RxCollectionEnum = Object.freeze({
  ...WsCollectionEnum
})
const RxModuleEnum = Object.freeze({
  WS: 'WS',
  SETTINGS: 'SETTINGS'
})

let rxdbProxy
let rxdbWrapper

class RxDBWrapper {
  async create () {
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.created = true
  }

  async init () {
    // todo проинициализировать модуль юзера. Взять оттуда userDoc = {wsRevision и userRole}
    logE('TODO!!!!!')

    class UserDoc {
      constructor () {
        this.wsRevision = 0
        this.userRole = 'MEMBER'
      }

      async atomicSet (prop, value) {
        this.wsRevision = value
      }
    }

    logD('init RXDB')
    assert(this.created, '!created')
    assert(!this.initialized, 'call init once!')
    this.workspace = new Workspace()
    await this.workspace.create(new UserDoc())
    this.initialized = true
  }

  async clearAll () {
    for (let module in RxModuleEnum) await this.clearModule()
  }

  async clearModule (rxModuleEnum) {
    assert(rxModuleEnum in RxModuleEnum, 'bad rxModuleEnum')
    switch (rxModuleEnum) {
      case RxModuleEnum.WS:
        return await this.workspace.clear()
      case RxModuleEnum.SETTINGS:
        throw new Error('not impl' + rxModuleEnum)
      default:
        throw new Error('bad module' + rxModuleEnum)
    }
  }

  getCollection (rxCollectionEnum) {
    assert(this.initialized, '!init')
    assert(rxCollectionEnum in RxCollectionEnum, 'bad collection' + rxCollectionEnum)
    switch (rxCollectionEnum) {
      case RxCollectionEnum.WS_NODE:
      case RxCollectionEnum.WS_CONTENT:
      case RxCollectionEnum.WS_CHAIN:
      case RxCollectionEnum.WS_SPHERE:
        return this.workspace.getWsCollection(rxCollectionEnum)
      default:
        throw new Error('bad rxCollectionEnum' + rxCollectionEnum)
    }
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
    let rxDoc = await this.workspace.upsertItem(item, withLock)
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return reactiveItemHolder.item
  }

  async deleteItem (id) {
    return await this.workspace.deleteItem(id)
  }

  async findWs (rxCollectionEnum, query) {
    let rxQuery = this.getCollection(rxCollectionEnum).find(query)
    let holder = new ReactiveListHolder()
    return await holder.create(rxQuery)
  }

  async lock() {
    await this.workspace.lock()
  }

  release() {
    this.workspace.release()
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
