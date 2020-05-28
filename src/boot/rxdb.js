import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache, ObjectQueries } from 'src/system/rxdb/cache'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'

import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { ReactiveItemHolder, ReactiveListHolder } from 'src/system/rxdb/reactive'
import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema'
import { CurrentUser } from 'src/system/rxdb/user'

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
    this.cache = new Cache()
    await this.cache.create()
    this.objectQueries = new ObjectQueries(this.cache)
    this.workspace = new Workspace()
    await this.workspace.create()
    this.created = true
  }

  async init (userOid) {
    this.currentUser = await this.objectQueries.findOne(userOid)
    await this.currentUser.init()

    logD('init RXDB')
    assert(this.created, '!created')
    assert(!this.initialized, 'call init once!')
    // eslint-disable-next-line no-constant-condition
    if (true) {
      class UserDoc {
        constructor () {
          this.wsRevision = 0
          this.userRole = 'MEMBER'
        }

        async atomicSet (prop, value) {
          this.wsRevision = value
        }
      }

      let currentUser = new UserDoc()
      this.workspace.switchOnSynchro(currentUser)
    }
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
      let rxDoc = await this.workspace.upsertItem(item, withLock)
      let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
      return reactiveItemHolder.reactiveItem
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

  async findWs (rxCollectionEnum, mangoQuery) {
    let rxQuery = this.getCollection(rxCollectionEnum).find(mangoQuery)
    let holder = new ReactiveListHolder()
    return await holder.create(rxQuery)
  }

  async findObjectOne (oid, priority) {
    return await this.objectQueries.findOneQueue(oid, priority)
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
