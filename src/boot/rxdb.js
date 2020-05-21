import assert from 'assert'
import { getItemWsCollection, getRxCollectionEnum, Workspace } from 'src/system/rxdb/workspace'
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
  WS_CONTENT: 'wsContent',
  WS_CHAIN: 'wsChain',
  WS_SPHERE: 'wsSphere'
})

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
      case RxCollectionEnum.wsNode:
      case RxCollectionEnum.wsContent:
      case RxCollectionEnum.wsChain:
      case RxCollectionEnum.wsSphere:
        return this.workspace.getRxCollection(rxCollectionEnum)
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

  async clear () {
    await this.workspace.clear()
  }

  setReactiveItem (vueObject, propName, rxDoc) {
    logD('setReactiveItem:', vueObject, propName, rxDoc)
    assert(vueObject._isVue, '!isVue')
    assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')

    vueObject.$set(vueObject, propName, rxDoc.toJSON())

    vueObject.$watch(propName, async (from, to) => {
      if (!to) return
      logD('update rxDoc...', to)
      const changesFromClientOrigin = to.changesFromClient
      try {
        to.changesFromClient = true // ставим флаг, чтобы не дергаться в rxDoc.$.subscribe(infinite loop). флаг снимется когда придут изменения с сервера
        await this.rxdb.node.atomicUpsert(to)
      } catch (err) {
        to.changesFromClient = changesFromClientOrigin
      }

      logD('update rxDoc complete', to)
    }, { deep: true, immediate: false })

    rxDoc.$.subscribe(changeEvent => {
      logD('update vue item...', changeEvent)
      if (changeEvent.changesFromClient) return
      vueObject.$set(vueObject, propName, JSON.parse(JSON.stringify(changeEvent))) // changeEvent нельзя менять вовне
      logD('update vue item complete')
    })
  }

  getRxCollectionFromItem (item) {
    if (item.wsItemType) {
      let wsCollectionEnum = getItemWsCollection(item)
      let rxCollectionEnum = getRxCollectionEnum(item)
      return this.getRxCollection(rxCollectionEnum)
    } else {
      throw new Error('unknownItem')
    }
  }

  find(){

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
