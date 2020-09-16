import assert from 'assert'
import { Workspace, WsCollectionEnum } from 'src/system/rxdb/workspace'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { Event } from 'src/system/rxdb/event'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { Lists, LstCollectionEnum } from 'src/system/rxdb/lists'
import { getReactive, Mutex, ReactiveListHolder } from 'src/system/rxdb/reactive'
import { ObjectsApi } from 'src/api/objects'
import { schemaKeyValue } from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'
import { GqlQueries } from 'src/system/rxdb/gql_query'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB)

// id: RxCollectionEnum::rawId
const RxCollectionEnum = Object.freeze({
   ...WsCollectionEnum, // списки мастерской
   ...LstCollectionEnum, // списки из objectShort
   OBJ: 'OBJ', // список закэшированных объектов
   GQL_QUERY: 'GQL_QUERY', // иное
   META: 'META'
})
const RxModuleEnum = Object.freeze({
   WS: 'WS',
   CACHE: 'CACHE'
})
const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк

const defaultCacheSize = 1 * 1024 * 1024 // 1Mb // todo увеличить до 10 МБ после тестирования
if (defaultCacheSize < 10 * 1024 * 1024) logW('TODO увеличить rxDbMemCache до 10 МБ после тестирования')

// кээширование объектов перед rxDb (rxDb  очень медленная)
class ReactiveItemDbMemCache {
   constructor () {
      this.cacheLru = new LruCache({
         max: defaultCacheSize,
         length: function (n, id) {
            return JSON.stringify(n).length + id.length
         },
         maxAge: 0 // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
      })
   }

   get (id) {
      return this.cacheLru.get(id)
   }

   set (id, reactiveItem) {
      assert(id, '!id')
      assert(reactiveItem, '!reactiveItem')
      this.cacheLru.set(id, reactiveItem)
   }

   del (id) {
      this.cacheLru.del(id)
   }

   reset () {
      this.cacheLru.reset()
   }
}

function getRxCollectionEnumFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length === 2, 'bad id!' + id)
   let rxCollection = parts[0]
   assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
   return rxCollection
}

function getRawIdFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length === 2, 'bad id!' + id)
   let rawId = parts[1]
   assert(rawId, 'bad id' + id)
   return rawId
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
      this.store = null // vuex
      this.reactiveItemDbMemCache = new ReactiveItemDbMemCache()
      addRxPlugin(require('pouchdb-adapter-idb'))
      addRxPlugin(RxDBLeaderElectionPlugin)
      addRxPlugin(RxDBValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)
      this.isLeader = () => this.isLeader_
   }

   onRxDocDelete (id) {
      assert(id)
      assert(this.store)
      this.reactiveItemDbMemCache.del(id)
   }

   // rxdb не удаляет элементы, а помечает удаленными! purgeDb - очистит помеченные удаленными
   async purgeDb () {
      const f = this.purgeDb
      logD(f, 'start')
      const t1 = performance.now()
      let purgeLastDateDoc = await this.get(RxCollectionEnum.META, 'purgeLastDate')
      let purgeLastDate = purgeLastDateDoc ? parseInt(purgeLastDateDoc) : 0
      if (Date.now() - purgeLastDate < purgePeriod) {
         logD(f, 'skip.')
         return
      }
      await this.set(RxCollectionEnum.META, { id: 'purgeLastDate', valueString: Date.now().toString() })
      let dump = await this.db.dump()
      await this.db.importDump(dump)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async create (store, recursive = false) {
      const f = this.create
      logD(f, 'start')
      const t1 = performance.now()
      assert(!this.created, 'this.created')
      try {
         this.store = store
         // console.time('createRxDatabase')
         this.db = await createRxDatabase({
            name: 'rxdb',
            adapter: 'idb', // <- storage-adapter
            multiInstance: true, // <- multiInstance (optional, default: true)
            eventReduce: false, // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
            pouchSettings: { revs_limit: 1 }
         })
         // console.timeEnd('createRxDatabase')
         // console.time('await this.db.collection')
         await this.db.collection({ name: 'meta', schema: schemaKeyValue })
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
         this.event = new Event(this.workspace, this.objects, this.lists, this.cache)
         this.gqlQueries = new GqlQueries(this.cache)
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // получит юзера, запустит обработку эвентов и синхронмзацию мастерской)
   async init (userOid) {
      const f = this.init
      logD(f, 'start')
      const t1 = performance.now()
      // assert(userOid)
      assert(this.created, '!created')
      this.event.init()
      // запрашиваем необходимые для работы данные (currentUser, nodeCategories, etc)
      let nodeCategories = await this.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories', { clientFirst: true })
      let emojiSpheres = await this.get(RxCollectionEnum.GQL_QUERY, 'emojiSpheres', { clientFirst: true })
      assert(nodeCategories && emojiSpheres, '!nodeCategories && emojiSpheres')
      let fetchCurrentUserFunc = async () => {
         return {
            notEvict: true, // живет вечно
            item: await ObjectsApi.objectFull(userOid),
            actualAge: 'day'
         }
      }
      // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возмется из кэша
      let currentUser
      if (userOid) {
         currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {
            fetchFunc: fetchCurrentUserFunc,
            force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
            clientFirst: true, // если в кэше есть данные - то они вернутся моментально (и обновятся в фоне)
            onFetchFunc: async (oldVal, newVal) => { // будет вызвана при получении данных от сервера
               this.workspace.switchOnSynchro() // запускаем синхронизацию только после получения актуального юзера с сервера (см clientFirst)
            }
         })
         this.workspace.setUser(currentUser) // для синхронизации мастерской с сервером
      }
      // logD(f, 'currentUser= ', currentUser)
      // let {items: [sphere2]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.LST_SEARCH, name: 'Golf', objectTypeEnum: { $in: ['CHAR', 'WORD', 'SENTENCE'] }}})
      // logD('!!! sphere2 = ', sphere2)
      // let votes = await this.get(RxCollectionEnum.GQL_QUERY, 'votes', {params: {oid: '79994642858295300'}})
      // logD('VOTES= ', votes)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async eraseWs () {
      this.workspace.switchOffSynchro()
      await this.workspace.clearCollections()
   }

   async erase (clearCache = true) {
      try {
         await this.lock()
         const f = this.deinit
         logD(f, 'start')
         const t1 = performance.now()
         assert(this.created, '!created')
         this.event.deInit()
         await this.eraseWs()
         await this.db.meta.remove()
         await this.db.collection({ name: 'meta', schema: schemaKeyValue })
         if (clearCache) await this.cache.clearCollections()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
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
         assert(this.store, '!this.store')
         await this.event.processEvent(event, this.store)
      } finally {
         this.release()
      }
   }

   // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
   async find (mangoQuery) {
      const f = this.find
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await this.lock() // нужно тк иногда запросы за одной и той же сущностью прилетают друг за другом и начинают выполняться "параллельно" (при этом не срабатывает reactiveItemDbMemCache)
         const queryId = JSON.stringify(mangoQuery)
         assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + queryId)
         let findResult
         let cachedReactiveList = this.reactiveItemDbMemCache.get(queryId)
         logD(f, 'addFindResult')
         if (cachedReactiveList) findResult = cachedReactiveList
         if (!findResult) {
            mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
            let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
            assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
            if (rxCollectionEnum in WsCollectionEnum) {
               // mangoQuery.selector = { rxCollectionEnum: WsCollectionEnum.WS_ANY }
               let rxQuery = await this.workspace.find(mangoQuery)
               const reactiveList = await (new ReactiveListHolder()).create(rxQuery)
               assert(reactiveList, '!reactiveList')
               findResult = reactiveList
            } else if (rxCollectionEnum in LstCollectionEnum) {
               let rxDoc = await this.lists.find(mangoQuery)
               findResult = getReactive(rxDoc) // {items, count, totalCount, nextPageToken }
            } else {
               throw new Error('bad collection: ' + rxCollectionEnum)
            }
            assert(findResult, '!findResult' + JSON.stringify(findResult))
            this.reactiveItemDbMemCache.set(queryId, findResult)
         }

         this.store.commit('debug/addFindResult', { queryId, findResult })
         let result
         if (findResult.getData) result = findResult.getData()
         else {
            assert(Array.isArray(findResult))
            result = {
               items: findResult,
               count: findResult.length,
               totalCount: findResult.length,
               nextPageToken: null
            }
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, result)
         return result
      } finally {
         this.release()
      }
   }

   async getRxDoc (id, { fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null, servicesApollo = null, params = null } = {}) {
      let rxCollectionEnum = getRxCollectionEnumFromId(id)
      let rawId = getRawIdFromId(id)
      let rxDoc
      if (rxCollectionEnum in WsCollectionEnum) {
         rxDoc = await this.workspace.get(id)
      } else if (rxCollectionEnum in LstCollectionEnum) {
         rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         rxDoc = await this.objects.get(id, priority, clientFirst, force, onFetchFunc)
      } else if (rxCollectionEnum === RxCollectionEnum.GQL_QUERY) {
         rxDoc = await this.gqlQueries.get(id, clientFirst, force, onFetchFunc, servicesApollo, params)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         rxDoc = await this.db.meta.findOne(rawId).exec()
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      return rxDoc
   }

   // clientFirst - вернуть данные из кэша (даже если они устарели), а потом в фоне реактивно обновить
   // onFetchFunc - коллбэк, который будет вызван, когда данные будут получены с сервера
   // params - допюпараметры для RxCollectionEnum.GQL_QUERY
   async get (rxCollectionEnum, rawId, { id = null, fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null, servicesApollo = null, params = null } = {}) {
      const f = this.get
      if (rawId) {
         assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
         assert(!rawId.includes('::'), '')
         assert(!id)
         id = makeId(rxCollectionEnum, rawId)
      } else {
         assert(!rxCollectionEnum)
      }
      assert(id)
      assert(id.includes('::'))
      let reactiveItem
      if (!force) { // вернем из быстрого кэша реактивных элементов
         let cachedReactiveItem = this.reactiveItemDbMemCache.get(id)
         if (cachedReactiveItem) {
            if ([RxCollectionEnum.OBJ, RxCollectionEnum.GQL_QUERY].includes(rxCollectionEnum)) {
               if (this.cache.isActual(id)) reactiveItem = cachedReactiveItem // элемент из RxCollectionEnum.OBJ, RxCollectionEnum.GQL_QUERY может устареть (тогда надо запросить заново)
            } else reactiveItem = cachedReactiveItem // остальные элементы не устаревают
         }
      }
      if (!reactiveItem) {
         let rxDoc = await this.getRxDoc(id, { fetchFunc, clientFirst, priority, force, onFetchFunc, servicesApollo, params })
         if (!rxDoc) return null
         reactiveItem = getReactive(rxDoc)
         this.reactiveItemDbMemCache.set(id, reactiveItem)
      }
      this.store.commit('debug/addReactiveItem', { id, reactiveItem })
      assert(reactiveItem.getData, '!reactiveItem.getData' + JSON.stringify(reactiveItem))
      return reactiveItem.getData()
   }

   // actualAge - актуально только для кэша
   async set (rxCollectionEnum, data, { actualAge, notEvict = false } = {}) {
      const f = this.set
      logD(f, 'start', rxCollectionEnum, data, { actualAge, notEvict })
      const t1 = performance.now()
      assert(data, '!data')
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      let rxDoc
      if (rxCollectionEnum in WsCollectionEnum) {
         rxDoc = await this.workspace.set(data)
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         let id = makeId(rxCollectionEnum, data.oid)
         rxDoc = await this.cache.set(id, data, actualAge, notEvict)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         assert(data.id && data.valueString, 'bad data' + JSON.stringify(data))
         rxDoc = await this.db.meta.atomicUpsert({ id: data.id, valueString: data.valueString })
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      if (!rxDoc) return null
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return getReactive(rxDoc).getData()
   }

   async remove (id) {
      const f = this.remove
      logD(f, 'start')
      const t1 = performance.now()
      let collection = getRxCollectionEnumFromId(id)
      if (collection in WsCollectionEnum) {
         await this.workspace.remove(id)
      } else {
         throw new Error('bad id!!' + id)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
