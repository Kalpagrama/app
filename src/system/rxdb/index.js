import assert from 'assert'
import { Workspace, WsCollectionEnum, WsItemTypeEnum } from 'src/system/rxdb/workspace'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { addRxPlugin, createRxDatabase } from 'rxdb'
import { Event } from 'src/system/rxdb/event'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { Lists, LstCollectionEnum } from 'src/system/rxdb/lists'
import { getReactive, Mutex, ReactiveListHolder } from 'src/system/rxdb/reactive'
import { NodeApi } from 'src/api/node'
import { ObjectsApi } from 'src/api/objects'
import { schemaKeyValue } from 'src/system/rxdb/schemas'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB)

// id: RxCollectionEnum::rawId
const RxCollectionEnum = Object.freeze({
  ...WsCollectionEnum, // списки мастерской
  ...LstCollectionEnum, // списки из objectShort
  OBJ: 'OBJ', // список закэшированных объектов
  OTHER: 'OTHER', // иное
  META: 'META'
})
const RxModuleEnum = Object.freeze({
  WS: 'WS',
  SETTINGS: 'SETTINGS',
  CACHE: 'CACHE'
})
const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк

function getRxCollectionEnumFromId (id) {
  assert(id, '!id')
  let parts = id.split('::')
  assert(parts.length === 2, 'bad id!' + id)
  let rxCollection = parts[0]
  assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
  return rxCollection
}

function makeId (rxCollectionEnum, rawId) {
  assert(rawId, '!rawId')
  assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
  assert(!rawId.includes('::'), 'bad rawId' + rawId)
  return rxCollectionEnum + '::' + rawId
}

class RxDBWrapper {
  constructor () {
    this.isLeader_ = false
    this.mutex = new Mutex()
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    this.isLeader = () => this.isLeader_
  }

  // rxdb не удаляет элементы, а помечает удаленными! purgeDb - очистит помеченные удаленными
  async purgeDb () {
    let f = this.purgeDb
    logD(f, 'purgeDb rxdb')
    let purgeLastDateDoc = await this.get(RxCollectionEnum.META, 'purgeLastDate')
    let purgeLastDate = purgeLastDateDoc ? parseInt(purgeLastDateDoc) : 0
    if (Date.now() - purgeLastDate < purgePeriod) return
    await this.setNoLock(RxCollectionEnum.META, { id: 'purgeLastDate', valueString: Date.now().toString() })
    let dump = await this.db.dump()
    await this.db.importDump(dump)
  }

  async init () {
    const f = this.init
    logD(f, 'start')
    this.db = await createRxDatabase({
      name: 'rxdb',
      adapter: 'idb', // <- storage-adapter
      multiInstance: true, // <- multiInstance (optional, default: true)
      eventReduce: true, // <- eventReduce (optional, default: true)
      pouchSettings: { revs_limit: 1 }
    })
    await this.db.collection({ name: 'meta', schema: schemaKeyValue })
    await this.purgeDb() // очистит бд от старых данных

    this.db.waitForLeadership().then(() => {
      logD(f, 'RXDB::LEADER!!!!')
      this.isLeader_ = true
    })
    this.workspace = new Workspace(this.db)
    this.cache = new Cache(this.db)
    this.objects = new Objects(this.cache)
    this.lists = new Lists(this.cache)
    this.event = new Event(this.workspace, this.objects, this.lists)
    await this.workspace.create()
    await this.cache.create()
    this.created = true
  }

  // вызывать после логина
  async setUser (userOid) {
    const f = this.setUser
    logD(f, 'start')
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
    // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возмется из кэша
    let currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {
      fetchFunc: fetchCurrentUserFunc,
      force: true,
      clientFirst: false
    })
    let fetchCategoriesFunc = async () => {
      return {
        notEvict: true, // живет вечно
        item: await NodeApi.nodeCategories(),
        actualAge: 'day'
      }
    }
    let nodeCategories = await this.get(RxCollectionEnum.OTHER, 'nodeCategories', { fetchFunc: fetchCategoriesFunc })
    if (currentUser) { // синхронизация мастерской с сервером
      this.workspace.switchOnSynchro(currentUser)
    }
  }

  async clearAll () {
    const f = this.clearAll
    logD(f, 'start')
    for (let module in RxModuleEnum) await this.clearModule(module)
    await this.db.meta.remove()
    await this.db.collection({ name: 'meta', schema: schemaKeyValue })
    logD(f, 'complete')
  }

  async clearModule (rxModuleEnum) {
    assert(rxModuleEnum in RxModuleEnum, 'bad rxModuleEnum')
    switch (rxModuleEnum) {
      case RxModuleEnum.WS:
        this.workspace.switchOffSynchro()
        return await this.workspace.clearCollections()
      case RxModuleEnum.SETTINGS:
        // throw new Error('not impl' + rxModuleEnum)
        return
      case RxModuleEnum.CACHE:
        return await this.cache.clearCollections()
      default:
        throw new Error('bad module' + rxModuleEnum)
    }
  }

  async lock () {
    await this.mutex.lock()
  }

  release () {
    this.mutex.release()
  }

  async processEvent (event) {
    try {
      await this.lock()
      await this.event.processEvent(event)
    } finally {
      this.release()
    }
  }

  async findNoLock (mangoQuery) {
    mangoQuery = JSON.parse(JSON.stringify(mangoQuery)) // mangoQuery модифицируется внутри
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query: ' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    if (rxCollectionEnum in WsCollectionEnum) {
      let rxQuery = await this.workspace.find(mangoQuery)
      let reactiveList = await (new ReactiveListHolder()).create(rxQuery)
      return { items: reactiveList, count: reactiveList.length, totalCount: reactiveList.length, nextPageToken: null }
    } else if (rxCollectionEnum in LstCollectionEnum) {
      let rxDoc = await this.lists.find(mangoQuery)
      return getReactive(rxDoc) // {items, count, totalCount, nextPageToken }
    } else {
      throw new Error('bad collection: ' + rxCollectionEnum)
    }
  }

  // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
  async find (mangoQuery) {
    try {
      await this.lock()
      return await this.findNoLock(mangoQuery)
    } finally {
      this.release()
    }
  }

  async getNoLock (rxCollectionEnum, rawId, { fetchFunc, clientFirst = true, priority = 0, force = false } = {}) {
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    assert(!rawId.includes('::'), '')
    let id = makeId(rxCollectionEnum, rawId)
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.get(id)
    } else if (rxCollectionEnum in LstCollectionEnum ||
      rxCollectionEnum === RxCollectionEnum.OTHER) {
      rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
      rxDoc = await this.objects.get(id, priority, clientFirst, force)
    } else if (rxCollectionEnum === RxCollectionEnum.META) {
      rxDoc = await this.db.meta.findOne(rawId).exec()
    } else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    if (!rxDoc) return null
    return getReactive(rxDoc)
  }

  async get (rxCollectionEnum, rawId, { fetchFunc, clientFirst = true, priority = 0, force = false } = {}) {
    try {
      await this.lock()
      return await this.getNoLock(rxCollectionEnum, rawId, { fetchFunc, clientFirst, priority, force })
    } finally {
      this.release()
    }
  }

  // withLock - см ReactiveItemHolder
  // actualAge - актуально только для кэша
  async setNoLock (rxCollectionEnum, data, { actualAge, withLock = true, notEvict = false } = {}) {
    const f = this.set
    assert(data, '!data')
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    logD(f, 'start', data, { actualAge, withLock, notEvict })
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.set(data, withLock)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
      let id = makeId(rxCollectionEnum, data.oid)
      rxDoc = await this.cache.set(id, data, actualAge, notEvict, null)
    } else if (rxCollectionEnum === RxCollectionEnum.META) {
      assert(data.id && data.valueString, 'bad data' + JSON.stringify(data))
      rxDoc = await this.db.meta.atomicUpsert({ id: data.id, valueString: data.valueString })
    } else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    if (!rxDoc) return null
    return getReactive(rxDoc)
  }

  async set (rxCollectionEnum, data, { actualAge, withLock = true, notEvict = false } = {}) {
    try {
      await this.lock()
      return await this.setNoLock(rxCollectionEnum, data, { actualAge, withLock, notEvict })
    } finally {
      this.release()
    }
  }

  async removeNoLock (id) {
    let collection = getRxCollectionEnumFromId(id)
    if (collection in WsCollectionEnum) {
      return await this.workspace.remove(id)
    } else {
      throw new Error('bad id!!' + id)
    }
  }

  async remove (id) {
    try {
      await this.lock()
      return await this.removeNoLock(id)
    } finally {
      this.release()
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
