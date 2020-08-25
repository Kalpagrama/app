import assert from 'assert'
import {Workspace, WsCollectionEnum, WsItemTypeEnum} from 'src/system/rxdb/workspace'
import {Cache} from 'src/system/rxdb/cache'
import {Objects} from 'src/system/rxdb/objects'
import {getLogFunc, LogLevelEnum, LogModulesEnum} from 'src/boot/log'
import {addRxPlugin, createRxDatabase, removeRxDatabase} from 'rxdb'
import {RxDBDevModePlugin} from 'rxdb/plugins/dev-mode'
import {Event} from 'src/system/rxdb/event'
import {RxDBLeaderElectionPlugin} from 'rxdb/plugins/leader-election'
import {RxDBValidatePlugin} from 'rxdb/plugins/validate'
import {RxDBJsonDumpPlugin} from 'rxdb/plugins/json-dump'
import {Lists, LstCollectionEnum} from 'src/system/rxdb/lists'
import {getReactive, Mutex, ReactiveListHolder} from 'src/system/rxdb/reactive'
import {NodeApi} from 'src/api/node'
import {ObjectsApi} from 'src/api/objects'
import {schemaKeyValue} from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'

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

const defaultCacheSize = 1 * 1024 * 1024 // 1Mb // todo увеличить до 10 МБ после тестирования
if (defaultCacheSize < 10 * 1024 * 1024) logW('TODO увеличить rxDbMemCache до 10 МБ после тестирования')

// кээширование объектов перед rxDb (rxDb  очень медленная)
class ReactiveItemDbMemCache {
  constructor() {
    this.cacheLru = new LruCache({
      max: defaultCacheSize,
      length: function (n, id) {
        return JSON.stringify(n).length + id.length
      },
      maxAge: 0 // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
    })
  }

  get(id) {
    return this.cacheLru.get(id)
  }

  set(id, reactiveItem) {
    assert(id, '!id')
    assert(reactiveItem, '!reactiveItem')
    assert(!this.cacheLru.has(id), '!this.cacheLru.has(id)')
    this.cacheLru.set(id, reactiveItem)
  }

  del(id) {
    this.cacheLru.del(id)
  }

  reset() {
    this.cacheLru.reset()
  }
}

function getRxCollectionEnumFromId(id) {
  assert(id, '!id')
  let parts = id.split('::')
  assert(parts.length === 2, 'bad id!' + id)
  let rxCollection = parts[0]
  assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
  return rxCollection
}

function getRawIdFromId(id) {
  assert(id, '!id')
  let parts = id.split('::')
  assert(parts.length === 2, 'bad id!' + id)
  let rawId = parts[1]
  assert(rawId, 'bad id' + id)
  return rawId
}

function makeId(rxCollectionEnum, rawId) {
  assert(rawId, '!rawId')
  assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
  assert(!rawId.includes('::'), 'bad rawId' + rawId)
  return rxCollectionEnum + '::' + rawId
}

class RxDBWrapper {
  constructor() {
    this.isLeader_ = false
    this.mutex = new Mutex()
    this.store = null // vuex
    this.reactiveItemDbMemCache = new ReactiveItemDbMemCache()
    addRxPlugin(require('pouchdb-adapter-idb'))
    addRxPlugin(RxDBLeaderElectionPlugin)
    addRxPlugin(RxDBValidatePlugin)
    addRxPlugin(RxDBJsonDumpPlugin)
    if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)
    this.isLeader = () => this.isLeader_
  }

  onRxDocDelete(id) {
    assert(id)
    this.reactiveItemDbMemCache.del(id)
  }

  // rxdb не удаляет элементы, а помечает удаленными! purgeDb - очистит помеченные удаленными
  async purgeDb() {
    const f = this.purgeDb
    logD(f, 'start')
    const t1 = performance.now()
    let purgeLastDateDoc = await this.get(RxCollectionEnum.META, 'purgeLastDate')
    let purgeLastDate = purgeLastDateDoc ? parseInt(purgeLastDateDoc) : 0
    if (Date.now() - purgeLastDate < purgePeriod) {
      logD(f, 'skip.')
      return
    }
    await this.set(RxCollectionEnum.META, {id: 'purgeLastDate', valueString: Date.now().toString()})
    let dump = await this.db.dump()
    await this.db.importDump(dump)
    logD(f, `complete: ${performance.now() - t1} msec`)
  }

  async init(store, recursive = false) {
    const f = this.init
    logD(f, 'start')
    const t1 = performance.now()
    try {
      this.store = store
      // console.time('createRxDatabase')
      this.db = await createRxDatabase({
        name: 'rxdb',
        adapter: 'idb', // <- storage-adapter
        multiInstance: true, // <- multiInstance (optional, default: true)
        eventReduce: false, // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
        pouchSettings: {revs_limit: 1}
      })
      // console.timeEnd('createRxDatabase')
      // console.time('await this.db.collection')
      await this.db.collection({name: 'meta', schema: schemaKeyValue})
      // console.timeEnd('await this.db.collection')
      // console.time('purgeDb')
      await this.purgeDb() // очистит бд от старых данных
      // console.timeEnd('purgeDb')
      this.reactiveItemDbMemCache.reset()
      this.db.waitForLeadership().then(() => {
        logD(f, 'RXDB::LEADER!!!!')
        this.isLeader_ = true
      })
      this.workspace = new Workspace(this.db)
      this.cache = new Cache(this.db)
      this.objects = new Objects(this.cache)
      this.lists = new Lists(this.cache)
      this.event = new Event(this.workspace, this.objects, this.lists)
      // console.time('workspace.create')
      await this.workspace.create()
      // console.timeEnd('workspace.create')
      // console.time('this.cache.create()')
      await this.cache.create()
      // console.timeEnd('this.cache.create()')
      this.created = true
    } catch (err) {
      if (recursive) throw err
      logE(f, 'ошибка при создания RxDatabase! очищаем и пересоздаем!', err)
      if (this.db) {
        await this.db.remove()
      }// предпочтительно, тк removeRxDatabase иногда глючит
      else {
        await removeRxDatabase('rxdb', 'idb')
      }
      await this.init(store, true)
    }
    logD(f, `complete: ${performance.now() - t1} msec`)
  }

  // вызывать после логина (запустит обработку эвентов и синхронмзацию мастерской)
  async startBackgroundProcesses(userOid) {
    const f = this.startBackgroundProcesses
    logD(f, 'start')
    const t1 = performance.now()
    assert(userOid)
    assert(this.created, '!created')
    this.event.init()
    // запрашиваем необходимые для работы данные (currentUser, nodeCategories, etc)
    let fetchCurrentUserFunc = async () => {
      return {
        notEvict: true, // живет вечно
        item: await ObjectsApi.objectFull(userOid),
        actualAge: 'day'
      }
    }
    console.time('get user from server')
    // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возмется из кэша
    let currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {
      fetchFunc: fetchCurrentUserFunc,
      force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
      clientFirst: true, // если в кэше есть данные - то они вернутся моментально (даже если устарели)
      onFetchFunc: async () => { // будет вызвана при получении данных от сервера
        this.workspace.synchroLoopWaitObj.break()// форсировать синхронизацию мастерской (могла измениться ревизия мастерской) (см synchroLoop)
      }
    })
    console.timeEnd('get user from server')
    let fetchCategoriesFunc = async () => {
      return {
        notEvict: true, // живет вечно
        item: await NodeApi.nodeCategories(),
        actualAge: 'day'
      }
    }
    console.time('get categories from server')
    let nodeCategories = await this.get(RxCollectionEnum.OTHER, 'nodeCategories', {fetchFunc: fetchCategoriesFunc})
    console.timeEnd('get categories from server')
    if (currentUser) { // синхронизация мастерской с сервером
      this.workspace.switchOnSynchro(currentUser)
    }
    logD(f, `complete: ${performance.now() - t1} msec`)
  }

  async stopBackgroundProcesses() {
    const f = this.stopBackgroundProcesses
    logD(f, 'start')
    const t1 = performance.now()
    assert(this.created, '!created')
    this.event.deInit()
    this.workspace.switchOffSynchro()
    logD(f, `complete: ${performance.now() - t1} msec`)
  }

  async clearAll() {
    try {
      await this.lock()
      const f = this.clearAll
      logD(f, 'start')
      const t1 = performance.now()
      for (let module in RxModuleEnum) await this.clearModule(module)
      await this.db.meta.remove()
      await this.db.collection({name: 'meta', schema: schemaKeyValue})
      logD(f, `complete: ${performance.now() - t1} msec`)
    } finally {
      this.release()
    }
  }

  async clearModule(rxModuleEnum) {
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

  async lock() {
    await this.mutex.lock()
  }

  release() {
    this.mutex.release()
  }

  async processEvent(event) {
    try {
      await this.lock()
      assert(this.store, '!this.store')
      await this.event.processEvent(event, this.store)
    } finally {
      this.release()
    }
  }

  // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
  async find(mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + JSON.stringify(mangoQuery))
    mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    if (rxCollectionEnum in WsCollectionEnum) {
      let rxQuery = await this.workspace.find(mangoQuery)
      let reactiveList = await (new ReactiveListHolder()).create(rxQuery)
      assert(reactiveList, '!reactiveList')
      return {items: reactiveList, count: reactiveList.length, totalCount: reactiveList.length, nextPageToken: null}
    } else if (rxCollectionEnum in LstCollectionEnum) {
      let rxDoc = await this.lists.find(mangoQuery)
      return getReactive(rxDoc) // {items, count, totalCount, nextPageToken }
    } else {
      throw new Error('bad collection: ' + rxCollectionEnum)
    }
  }

  async getRxDoc(id, {fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null} = {}) {
    let rxCollectionEnum = getRxCollectionEnumFromId(id)
    let rawId = getRawIdFromId(id)
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.get(id)
    } else if (rxCollectionEnum in LstCollectionEnum ||
      rxCollectionEnum === RxCollectionEnum.OTHER) {
      rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
      rxDoc = await this.objects.get(id, priority, clientFirst, force, onFetchFunc)
    } else if (rxCollectionEnum === RxCollectionEnum.META) {
      rxDoc = await this.db.meta.findOne(rawId).exec()
    } else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    return rxDoc
  }

  // clientFirst - вернуть данные из кэша (даже если они устарели), а потом в фоне реактивно обновить
  // onFetchFunc - коллбэк, который будет вызван, когда данные будут получены с сервера
  async get(rxCollectionEnum, rawId, {id = null, fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null} = {}) {
    const f = this.get
    if (rawId) {
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      assert(!rawId.includes('::'), '')
      assert(!id)
      id = makeId(rxCollectionEnum, rawId)
    } else {
      assert(!rxCollectionEnum)
      assert(id)
      assert(id.includes('::'))
    }
    let cachedReactiveItem = this.reactiveItemDbMemCache.get(id)
    if (cachedReactiveItem) return cachedReactiveItem
    let rxDoc = await this.getRxDoc(id, {fetchFunc, clientFirst, priority, force, onFetchFunc})
    if (!rxDoc) return null
    let reactiveItem = getReactive(rxDoc)
    this.reactiveItemDbMemCache.set(id, reactiveItem)
    return reactiveItem
  }

  // actualAge - актуально только для кэша
  async set(rxCollectionEnum, data, {actualAge, notEvict = false} = {}) {
    const f = this.set
    assert(data, '!data')
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    logD(f, 'start', rxCollectionEnum, data, {actualAge, notEvict})
    let rxDoc
    if (rxCollectionEnum in WsCollectionEnum) {
      rxDoc = await this.workspace.set(data)
    } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
      let id = makeId(rxCollectionEnum, data.oid)
      rxDoc = await this.cache.set(id, data, actualAge, notEvict)
    } else if (rxCollectionEnum === RxCollectionEnum.META) {
      assert(data.id && data.valueString, 'bad data' + JSON.stringify(data))
      rxDoc = await this.db.meta.atomicUpsert({id: data.id, valueString: data.valueString})
    } else {
      throw new Error('bad collection' + rxCollectionEnum)
    }
    if (!rxDoc) return null
    return getReactive(rxDoc)
  }

  async remove(id) {
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

export {
  rxdbWrapper as rxdb,
  RxModuleEnum,
  RxCollectionEnum,
  getRxCollectionEnumFromId,
  getRawIdFromId,
  getReactive,
  makeId
}
