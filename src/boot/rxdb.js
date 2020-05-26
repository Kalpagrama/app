import Vue from 'vue'
import assert from 'assert'
import { Workspace, WsCollectionEnum, Mutex } from 'src/system/rxdb/workspace'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin, createRxDatabase, isRxDocument, isRxQuery, removeRxDatabase } from 'rxdb'
import { skip } from 'rxjs/operators'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import debounce from 'lodash/debounce'
// import difference from 'lodash/difference'

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

// класс-обертка над rxDoc для реактивности
class ReactiveItemHolder {
  constructor (rxDoc) {
    assert(isRxDocument(rxDoc), '!isRxDocument(rxDoc)')
    logD('ReactiveItemHolder::constructor', rxDoc.id)
    this.rxDoc = rxDoc
    this.mutex = new Mutex()
    this.vm = new Vue({
      data: {
        item: rxDoc.toJSON()
      }
    })
    this.rxDocSubscribe()
    this.itemSubscribe()
  }

  rxDocSubscribe () {
    const f = this.rxDocSubscribe
    if (this.rxDocSubscription) return
    // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
    this.rxDocSubscription = this.rxDoc.$.pipe(skip(1)).subscribe(async change => {
      try {
        await this.mutex.lock()
        this.itemUnsubscribe()
        logD(f, 'rxDoc changed', change)
        for (let key in change) this.vm.item[key] = change[key] // изменившиеся и добавившиеся
        for (let key in this.vm.item) {
          if (!(key in change)) delete this.vm.item[key] // удалившиеся
        }
      } finally {
        this.itemSubscribe()
        this.mutex.release()
      }
    })
  }

  rxDocUnsubscribe () {
    if (this.rxDocSubscription) this.rxDocSubscription.unsubscribe()
    delete this.rxDocSubscription
  }

  itemSubscribe () {
    const f = this.itemSubscribe
    if (this.itemUnsubscribeFunc) return
    this.itemUnsubscribeFunc = this.vm.$watch('item', (newVal, oldVal) => {
      // item изменилась (из UI)
      // logD(f, 'item changed from UI', newVal)
      if (!this.debouncedItemSave) {
        this.debouncedItemSave = debounce(async (newVal) => {
          let f = this.debouncedItemSave
          try {
            await this.mutex.lock()
            this.rxDocUnsubscribe()
            logD(f, 'item changed from UI (debounce)', newVal)
            await rxdbWrapper.upsertItem(newVal) // сохраним в БД
          } finally {
            this.rxDocSubscribe()
            this.mutex.release()
          }
        }, 2000)
      }
      this.debouncedItemSave(newVal)
    }, { deep: true, immediate: false })
  }

  itemUnsubscribe () {
    const f = this.itemUnsubscribe
    if (this.itemUnsubscribeFunc) this.itemUnsubscribeFunc()
    delete this.itemUnsubscribeFunc
  }

  get () {
    return this.vm.item
  }
}

class ReactiveListHolder {
  async create (rxQuery) {
    logD('ReactiveListHolder::constructor', rxQuery)
    assert(isRxQuery(rxQuery), '!isRxQuery(rxQuery)')
    this.rxQuery = rxQuery
    this.mutex = new Mutex()
    let docs = await rxQuery.exec()
    assert(Array.isArray(docs), 'Array.isArray(docs)')
    this.vm = new Vue({
      data: {
        list: docs.map(rxDoc => {
          let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
          return reactiveItemHolder.get()
        })
      }
    })
    assert(Array.isArray(this.vm.list), 'Array.isArray(this.vm.list)')
    this.rxQuerySubscribe()
    this.listSubscribe()
    return this.vm.list
  }

  rxQuerySubscribe () {
    const f = this.rxQuerySubscribe
    if (this.rxQuerySubscription) return
    // skip - для пропуска n первых эвантов (после subscribe - сразу генерится эвент(даже если данные не менялись))
    this.rxQuerySubscription = this.rxQuery.$.pipe(skip(1)).subscribe(async results => {
      try {
        await this.mutex.lock()
        this.listUnsubscribe()
        // rxQuery дергается даже когда поменялся его итем ( даже если это не влияет на рез-тат!!!)
        if (this.vm.list.length === results.length) {
          let arrayChanged = false
          for (let i = 0; i < results.length; i++) {
            if (results[i].id !== this.vm.list[i].id) {
              arrayChanged = true
              break
            }
          }
          if (!arrayChanged) return // если список не изменился - просто выходим
        }
        logD(f, 'rxQuery changed', results)
        let items = results.map(rxDoc => {
          let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
          return reactiveItemHolder.get()
        })
        this.vm.list.splice(0, this.vm.list.length, ...items)
      } finally {
        this.listSubscribe()
        this.mutex.release()
      }
    })
  }

  rxQueryUnsubscribe () {
    if (this.rxQuerySubscription) this.rxQuerySubscription.unsubscribe()
    delete this.rxQuerySubscription
  }

  listSubscribe () {
    const f = this.listSubscribe
    if (this.listUnsubscribeFunc) return
    this.listUnsubscribeFunc = this.vm.$watch('list', async (newVal, oldVal) => {
      assert(false, 'изменения списка из UI запрещены')
      // // list изменился (из UI)
      // if (!this.debouncedListSave) {
      //   this.debouncedListSave = debounce(async (newVal, oldVal) => {
      //     let f = this.debouncedListSave
      //     try {
      //       await this.mutex.lock()
      //       this.rxQueryUnsubscribe()
      //       logD(f, 'reactive list changed from UI', newVal)
      //       let insertedItems = difference(newVal, oldVal, (left, right) => left.id === right.id) // что добавилось в массив
      //       let deletedItems = difference(oldVal, newVal, (left, right) => left.id === right.id) // что удалено из массива
      //
      //       for (let insertedItem of insertedItems) {
      //         assert(!insertedItem.id)
      //         await rxdbWrapper.upsertItem(insertedItem) // сохраним в БД
      //       }
      //       for (let deletedItem of deletedItems) {
      //         assert(deletedItem.id)
      //         await rxdbWrapper.delete(deletedItem.id) // сохраним в БД
      //       }
      //     } finally {
      //       this.rxQuerySubscribe()
      //       this.mutex.release()
      //     }
      //   }, 300)
      // }
      // this.debouncedListSave(newVal, oldVal)
    }, { deep: false, immediate: false })
  }

  listUnsubscribe () {
    if (this.listUnsubscribeFunc) this.listUnsubscribeFunc()
    delete this.listUnsubscribeFunc
  }
}

class RxDBWrapper {
  async create () {
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.created = false
    this.workspace = new Workspace()
    await this.workspace.create()
    this.created = true
  }

  async init () {
    // todo проинициализировать модуль юзера. Взять оттуда userDoc = {wsRevision и userRole}
    // logE('TODO!!!!!')

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
    assert(this.workspace, '!this.workspace')
    assert(!this.initialized, 'call init once!')
    // await this.workspace.init(new UserDoc())
    await this.workspace.init()
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
  async upsertItem (item) {
    let rxDoc = await this.workspace.upsertItem(item)
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return reactiveItemHolder.get()
  }

  async deleteItem (id) {
    return await this.workspace.deleteItem(id)
  }

  async findWs (rxCollectionEnum, query) {
    let rxQuery = this.getCollection(rxCollectionEnum).find(query)
    let holder = new ReactiveListHolder()
    return await holder.create(rxQuery)
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
