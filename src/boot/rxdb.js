import assert from 'assert'
import { getItemWsCollection, getRxCollectionEnum, Workspace, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { cache } from 'src/boot/cache'
import { addRxPlugin, createRxDatabase, isRxDocument } from 'rxdb'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

// const RxCollectionEnum = Object.freeze({
//   wsNode: 'wsNode',
//   wsContent: 'wsContent',
//   wsChain: 'wsChain',
//   wsSphere: 'wsSphere'
// })

const RxCollectionEnum = Object.freeze({
  WS_NODE: 'WS_NODE',
  WS_CONTENT: 'WS_CONTENT',
  WS_CHAIN: 'WS_CHAIN',
  WS_SPHERE: 'WS_SPHERE'
})
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
class RxDBWrapper {
  async postCreate () {
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.rxdb = await createRxDatabase({
      name: 'ws',
      adapter: 'idb', // <- storage-adapter
      multiInstance: true, // <- multiInstance (optional, default: true)
      eventReduce: true // <- eventReduce (optional, default: true)
    })
    this.workspace = new Workspace(this.rxdb)
  }

  async init (userRole) {
    assert(this.workspace, '!this.workspace')
    assert(!this.initialized, 'call init once!')
    assert(['ADMIN', 'MODERATOR', 'MEMBER', 'GUEST'].includes(userRole), '!userRole:' + userRole)
    try {
      if (userRole !== 'GUEST') await this.workspace.init() // для гостей мастерской - нет!
    } catch (err) {
      logE('ошибка при инициализации Workspace!', err)
      await this.workspace.clear()
      await this.workspace.init()
    }
    this.initialized = true
  }

  getRxCollection (rxCollectionEnum) {
    assert(this.initialized, '!init')
    assert(rxCollectionEnum in RxCollectionEnum, 'bad collection' + rxCollectionEnum)
    switch (rxCollectionEnum) {
      case RxCollectionEnum.WS_NODE:
      case RxCollectionEnum.WS_CONTENT:
      case RxCollectionEnum.WS_CHAIN:
      case RxCollectionEnum.WS_SPHERE:
        return this.workspace.getRxCollection(rxCollectionEnum)
      default:
        throw new Error('bad rxCollectionEnum' + rxCollectionEnum)
    }
  }

  getItemRxCollection (item) {
    assert(item.wsItemType, '!item.wsItemType')
    switch (item.wsItemType) {
      case WsItemTypeEnum.NODE:
        return this.getRxCollection(RxCollectionEnum.WS_NODE)
      case WsItemTypeEnum.CONTENT_WITH_NOTES:
        return this.getRxCollection(RxCollectionEnum.WS_CONTENT)
      case WsItemTypeEnum.CHAIN:
        return this.getRxCollection(RxCollectionEnum.WS_CHAIN)
      case WsItemTypeEnum.SPHERE:
        return this.getRxCollection(RxCollectionEnum.WS_SPHERE)
      default:
        assert(false, 'bad wsItemType:' + item.wsItemType)
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

  async clear () {
    await this.workspace.clear()
  }

  async upsertItem (item) {
    logD('upsertItem item=', item)
    let doc
    // просто atomicUpsert не получается использовать тк не срабатывают хуки (normalizeWsItem)
    if (item.id) {
      doc = await this.getItemRxCollection(item).atomicUpsert(item)
    } else {
      doc = await this.getItemRxCollection(item).insert(item)
    }
    logD('upsertItem doc=', doc)
    assert(isRxDocument(doc), '!isRxDocument' + JSON.stringify(doc))
    return doc
  }

  async deleteItem (item) {
    assert(item && item.id, 'item && item.id => bad item!')
    item.changesFromClient = true
    await this.getItemRxCollection(item).find().where('id').eq(item.id).remove()
  }
}

// делаем геттеры (чтобы можно было писать так: Vue.prototype.$rxdb.wsNode.find(...).where(...).exec())
async function makeRxWrapperProxy () {
  rxdb = new RxDBWrapper()
  await rxdb.postCreate()
  let rxdbProxy = new Proxy(rxdb, {
    get (target, prop) {
      if (prop in RxCollectionEnum) return target.getRxCollection(prop)
      let value = target[prop]
      return (typeof value === 'function') ? value.bind(target) : value // иначе - внутри RxDB this - будет указывать на Proxy
    },
    set (target, prop, val) { // запрещаем менять свойства
      return false
    },
    deleteProperty (target, prop) { // запрещаем удаление свойства
      return false
    }
  })
  return rxdbProxy
}

let rxdb
export default async ({ Vue, store, router: VueRouter }) => {
  try {
    Vue.prototype.$rxdb = rxdb = await makeRxWrapperProxy()
  } catch (err) {
    logE(err)
  }
}
export { rxdb, RxCollectionEnum }
