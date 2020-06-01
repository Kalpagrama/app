import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin } from 'rxdb'
import { Event } from 'src/system/rxdb/event'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { Lists, LstCollectionEnum } from 'src/system/rxdb/lists'
import { getReactive, ReactiveListHolder } from 'src/system/rxdb/reactive'
import { NodeApi } from 'src/api/node'
import { ObjectsApi } from 'src/api/objects'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

// id: RxCollectionEnum::rawId
const RxCollectionEnum = Object.freeze({
  ...WsCollectionEnum, // списки мастерской
  ...LstCollectionEnum, // списки из objectShort
  OBJ: 'OBJ', // список закэшированных объектов
  OTHER: 'OTHER' // иное
})
const RxModuleEnum = Object.freeze({
  WS: 'WS',
  SETTINGS: 'SETTINGS',
  CACHE: 'CACHE'
})

function getRxCollectionEnumFromId (id) {
  assert(id, '!id')
  let parts = id.split('::')
  assert(parts.length === 2, 'bad id!' + id)
  let rxCollection = parts[0]
  assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
  return rxCollection
}

function makeId(rxCollectionEnum, rawId){
  assert(rawId, '!rawId')
  assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
  assert(!rawId.includes('::'), 'bad rawId' + rawId)
  return rxCollectionEnum + '::' + rawId
}

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
        item: await ObjectsApi.objectFull(userOid),
        actualAge: 'day'
      }
    }
    let currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {fetchFunc: fetchCurrentUserFunc})
    let fetchCategoriesFunc = async () => {
      return {
        notEvict: true, // живет вечно
        item: await NodeApi.nodeCategories(),
        actualAge: 'day'
      }
    }
    let nodeCategories = await this.get(RxCollectionEnum.OTHER, 'nodeCategories', {fetchFunc: fetchCategoriesFunc})
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

  // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
  async find (mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    if (rxCollectionEnum in WsCollectionEnum) {
      let rxQuery = await this.workspace.find(mangoQuery)
      let reactiveList = await (new ReactiveListHolder()).create(rxQuery)
      return {items: reactiveList, count: reactiveList.length, totalCount: reactiveList.length, nextPageToken: null }
    } else if (rxCollectionEnum in LstCollectionEnum) {
      let rxDoc = await this.lists.find(mangoQuery)
      return getReactive(rxDoc) // {items, count, totalCount, nextPageToken }
    } else {
      throw new Error('bad collection: ' + rxCollectionEnum)
    }
  }

  async get (rxCollectionEnum, rawId, {fetchFunc, clientFirst = true, priority = 0} = {}) {
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    assert(!rawId.includes('::'), '')
    let id = makeId(rxCollectionEnum, rawId)
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.get(id)
    } else if (rxCollectionEnum in LstCollectionEnum ||
      rxCollectionEnum === RxCollectionEnum.OTHER) {
      rxDoc = await this.cache.get(id, fetchFunc, clientFirst)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ){
      return await this.objects.get(id, priority)
    }
    else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    if (!rxDoc) return null
    return getReactive(rxDoc)
  }

  // withLock - см ReactiveItemHolder
  // actualAge - актуально только для кэша
  async set (rxCollectionEnum, data, {actualAge, withLock = true, notEvict = false} = {}) {
    const f = this.set
    assert(data, '!data')
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    logD(f, 'start', data, {actualAge, withLock, notEvict})
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.set(data, withLock)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
      let id = makeId(rxCollectionEnum, data.oid)
      rxDoc = await this.cache.set(id, data, actualAge, notEvict, null)
    } else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    if (!rxDoc) return null
    return getReactive(rxDoc)
  }

  async remove (id) {
    let collection = getRxCollectionEnumFromId(id)
    if (collection in WsCollectionEnum) {
      return await this.workspace.remove(id)
    } else {
      throw new Error('bad id!!' + id)
    }
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

export { rxdbWrapper as rxdb, RxModuleEnum, RxCollectionEnum, getRxCollectionEnumFromId, getReactive }
