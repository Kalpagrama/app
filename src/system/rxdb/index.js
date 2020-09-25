import assert from 'assert'
import { Workspace, WsCollectionEnum } from 'src/system/rxdb/workspace'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'
// import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { Event } from 'src/system/rxdb/event'
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { Lists, LstCollectionEnum } from 'src/system/rxdb/lists'
import { getReactive, Mutex, ReactiveListHolder } from 'src/system/rxdb/reactive'
import { ObjectsApi } from 'src/api/objects'
import { schemaKeyValue } from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'
import { GqlQueries } from 'src/system/rxdb/gql_query'
import { getInstanceId, globalLock, globalRelease, isLeader } from 'src/system/services'

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
      this.created = false
      this.mutex = new Mutex()
      this.store = null // vuex
      this.reactiveItemDbMemCache = new ReactiveItemDbMemCache()
      addRxPlugin(require('pouchdb-adapter-idb'))
      addRxPlugin(RxDBValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      // if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)
      this.processStoreEvent = async (event) => {
         // одна из вкладок создала rxdb либо выполнила rxdb.deInitGlobal(пересрздала rxdb). Надо обновить коллекции
         if (event.key && event.key.in('k_rxdb_create_date', 'k_rxdb_init_global_date', 'k_rxdb_deinit_global_date')) {
            if (this.created && event.newValue) {
               const f = this.processStoreEvent
               f.nameExtra = 'processStoreEvent'
               logD(f, 'start', event.key, event)
               const t1 = performance.now()
               try {
                  switch (event.key) {
                     case 'k_rxdb_create_date':
                        await this.updateCollections('create')
                        break
                     case 'k_rxdb_init_global_date':
                        await this.init()
                        break
                     case 'k_rxdb_deinit_global_date':
                        await this.updateCollections('create')
                        await this.deInit()
                        break
                     default:
                        throw new Error('bad event' + event.key)
                  }
               } catch (err) {
                  logE('cant process rxdb event!', err)
                  alert('error on processStoreEvent: ' + JSON.stringify(err))
                  await window.location.reload()
               } finally {
                  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, `isLeader = ${isLeader()}`)
               }
            }
         }
      }
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
      assert(this.db, '!this.db')

      let purgeLastDate = parseInt(localStorage.getItem('k_rxdb_last_purge_date') || '0')
      if (Date.now() - purgeLastDate < purgePeriod) {
         logD(f, 'skip.')
         return
      }
      try {
         let dump = await this.db.dump()
         await this.db.importDump(dump)
      } catch (err) {
         logE('cant purgeDb', err)
         throw err
      } finally {
         localStorage.setItem('k_rxdb_last_purge_date', getInstanceId())
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async create (store) {
      const f = this.create
      logD(f, 'start')
      const t1 = performance.now()
      assert(!this.created, 'this.created')
      try {
         await globalLock()
         this.store = store
         logD('before createRxDatabase')
         this.db = await createRxDatabase({
            name: 'rxdb',
            adapter: 'idb', // <- storage-adapter
            multiInstance: true, // <- multiInstance (optional, default: true)
            eventReduce: false, // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
            pouchSettings: { revs_limit: 1 }
         })
         logD('after createRxDatabase')
         await this.purgeDb() // очистит бд от старых данных

         this.reactiveItemDbMemCache.reset()
         this.workspace = new Workspace(this.db)
         this.cache = new Cache(this.db)
         this.objects = new Objects(this.cache)
         this.lists = new Lists(this.cache)
         this.event = new Event(this.workspace, this.objects, this.lists, this.cache)
         this.gqlQueries = new GqlQueries(this.cache)
         await this.updateCollections('create')
         await this.workspace.create()
         await this.cache.create()
         this.created = true
      } catch (err) {
         logE(f, 'ошибка при создания RxDatabase! очищаем и пересоздаем!', err)
         if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
         else await removeRxDatabase('rxdb', 'idb')
         throw err
      } finally {
         globalRelease()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, `isLeader = ${isLeader()}`, this.created)
      }
   }

   async updateCollections (operation, collections = ['workspace', 'cache']) {
      assert(operation.in('create', 'delete', 'recreate'))
      const f = this.updateCollections
      const t1 = performance.now()
      logD(f, 'start')
      if (operation.in('delete', 'recreate')) {
         if (this.db.meta) await this.db.meta.remove()
      }
      if (operation.in('create', 'delete', 'recreate')) {
         if (this.db.meta) await this.db.meta.destroy()
      }
      if (operation.in('create', 'recreate')) {
         await this.db.collection({ name: 'meta', schema: schemaKeyValue })
      }
      for (let collection of collections) {
         if (this[collection]) await this[collection].updateCollections(operation)
      }
      if (!(await this.get(RxCollectionEnum.META, 'rxdbCreateDate'))) { // эта вкладка первой инициализироваля rxdb
         await this.set(RxCollectionEnum.META, { id: 'rxdbCreateDate', valueString: Date.now().toString() })
         localStorage.setItem('k_rxdb_create_date', Date.now().toString()) // сообщаем другим вкладкам
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // получит юзера, запустит обработку эвентов и синхронмзацию мастерской) dummyUser - для входа без регистрации
   async init () {
      assert(this.created, '!created')
      assert(!this.initialized, 'this.initialized уже!')
      const f = this.init
      const t1 = performance.now()
      logD(f, 'start')
      if (!(await this.isInitializedGlobal())) {
         logD(f, 'ждем пока сработает initGlobal (она нас вызовет повторно)')
         return
      }
      try {
         await this.lock()
         this.event.init()
         let authUser = JSON.parse(await this.get(RxCollectionEnum.META, 'authUser') || 'null') // данные запоминаются после первого успешного init на одной из вкладок
         assert(authUser, 'authUser')
         let { userOid, dummyUser } = authUser
         assert(userOid || dummyUser, '!userOid || dummyUser')
         // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возьмется из кэша
         let currentUser
         if (userOid) {
            let fetchCurrentUserFunc = async () => {
               return {
                  notEvict: true, // живет вечно
                  item: await ObjectsApi.objectFull(userOid),
                  actualAge: 'day'
               }
            }
            currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {
               fetchFunc: fetchCurrentUserFunc,
               force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
               clientFirst: true, // если в кэше есть данные - то они вернутся моментально (и обновятся в фоне)
               onFetchFunc: async (oldVal, newVal) => { // будет вызвана при получении данных от сервера
                  this.workspace.switchOnSynchro() // запускаем синхронизацию только после получения актуального юзера с сервера (см clientFirst)
               }
            })
            assert(currentUser, '!currentUser!!!!')// должен быть в rxdb после init
            this.workspace.setUser(currentUser) // для синхронизации мастерской с сервером
         } else {
            assert(dummyUser, '!dummyUser')
            let fetchCurrentUserFunc = async () => {
               return {
                  notEvict: true, // живет вечно
                  item: dummyUser,
                  actualAge: 'century' // dummyUser не устаревает
               }
            }
            assert(dummyUser.oid, 'dummyUser.oid')
            currentUser = await this.get(RxCollectionEnum.OBJ, dummyUser.oid, {
               fetchFunc: fetchCurrentUserFunc,
               force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
               clientFirst: false // обязательно брать из fetchFunc
            })
            assert(currentUser, '!currentUser (dummyUser)!!') // должен быть в rxdb после init
         }

         assert(currentUser, '!currentUser') // init вызывается только после успешного initGlobal (а он заполнят юзера)
         this.getCurrentUser = () => {
            return currentUser
         }
         this.initialized = true
      } finally {
         this.release()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
   }

   async deInit (fromDeinitGlobal = false) {
      const f = this.deInit
      const t1 = performance.now()
      try {
         logD(f, 'start', fromDeinitGlobal)
         assert(this.created, '!created')
         await this.lock()
         if (fromDeinitGlobal) this.event.deInit() // подписку отменяем только 1 раз
         this.workspace.switchOffSynchro()
         delete this.getCurrentUser
         this.reactiveItemDbMemCache.reset()
         if (fromDeinitGlobal) await this.updateCollections('recreate', ['workspace', 'cache']) // fromDeinitGlobal - кейс только для  deInitGlobal
         this.initialized = false
      } finally {
         this.release()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
   }

   // запускается единожды после регистрации
   async initGlobal ({ userOid, dummyUser }) {
      const f = this.init
      logD(f, 'start')
      const t1 = performance.now()
      assert(this.created, '!created') // нужна коллекция META
      assert(!(await this.isInitializedGlobal()), '!!this.isInitializedGlobal()')
      assert(userOid || dummyUser, '!userOid || dummyUser')
      try {
         await globalLock()
         await this.set(RxCollectionEnum.META, { id: 'authUser', valueString: JSON.stringify({ userOid, dummyUser }) })
         await this.init() // инициализируем текущую вкладку
         localStorage.setItem('k_rxdb_init_global_date', Date.now().toString()) // сообщаем другим вкладкам
      } finally {
         globalRelease()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, `isLeader = ${isLeader()}`)
      }
   }

   // удалит данные в rxdb (сообщит об этом другим вкладкам)
   async deInitGlobal () {
      const f = this.deInitGlobal
      logD(f, 'start', this.created, isLeader())
      const t1 = performance.now()
      try {
         await globalLock()
         await this.deInit(true) // деинициализируем текущую вкладку
         localStorage.setItem('k_rxdb_deinit_global_date', Date.now().toString()) // сообщаем другим вкладкам
      } catch (err) {
         logE(f, 'err on deInitGlobal! remove db!', err)
         if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
         else await removeRxDatabase('rxdb', 'idb')
         throw err
      } finally {
         globalRelease()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
   }

   async isInitializedGlobal () {
      assert(this.created, '!created')
      let authUser = await this.get(RxCollectionEnum.META, 'authUser') // данные запоминаются после первого успешного init на одной из вкладок
      return !!authUser
   }

   async lock () {
      await this.mutex.lock()
   }

   release () {
      this.mutex.release()
   }

   async processEvent (event) {
      const f = this.processEvent
      const t1 = performance.now()
      logD(f, 'start')
      try {
         assert(this.initialized, '! this.initialized !')
         if (!isLeader()) return // только одна вкладка меняет rxdb по эвентам сервера
         await globalLock(false) // запускаем без рекурсии (чтобы дождалась пока отработает rxdb.deInitGlobal, synchronize ws и др)
         await this.lock()
         assert(this.store, '!this.store')
         await this.event.processEvent(event, this.store)
      } finally {
         this.release()
         globalRelease()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
   }

   // вернет список из objectFull
   async find (mangoQuery) {
      const f = this.find
      const t1 = performance.now()

      logD(f, 'start', mangoQuery)
      let pageToken = mangoQuery.selector.pageToken || {indx: 0, oid: null}
      let limit = Math.min(mangoQuery.selector.limit || 10, 10)
      delete mangoQuery.selector.pageToken // мешает нормальному кэшированию запросов в findInternal
      delete mangoQuery.selector.limit // мешает нормальному кэшированию запросов в findInternal
      let objectShortList = await this.findInternal(mangoQuery)
      let fullItems = []
      let startIndx = pageToken.indx
      for (let itemShort of objectShortList.items.slice(startIndx, startIndx + limit)) {
         assert(itemShort.oid)
         let fullItem = await this.get(RxCollectionEnum.OBJ, itemShort.oid)
         fullItems.push(fullItem)
      }
      let nextIndx = startIndx + limit
      let nextItem = objectShortList.items[nextIndx]
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, fullItems)
      return {
         items: fullItems,
         count: fullItems.length,
         totalCount: objectShortList.count,
         nextPageToken: nextItem ? {indx: nextIndx, oid: nextItem.oid} : null,
         prevPageToken: pageToken
      }
   }

   // вернет список из objectShort
   // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
   async findInternal (mangoQuery) {
      const f = this.findInternal
      const t1 = performance.now()
      logD(f, 'start', mangoQuery)
      try {
         assert(this.initialized, '! this.initialized !')
         await this.lock() // нужно тк иногда запросы за одной и той же сущностью прилетают друг за другом и начинают выполняться "параллельно" (при этом не срабатывает reactiveItemDbMemCache)
         const queryId = JSON.stringify(mangoQuery)
         assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + queryId)
         let findResult
         let cachedReactiveList = this.reactiveItemDbMemCache.get(queryId)
         // logD(f, 'addFindResult')
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
         return result
      } finally {
         this.release()
         // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, result)
      }
   }

   async getRxDoc (id, { fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null, params = null } = {}) {
      const f = this.getRxDoc
      const t1 = performance.now()
      // logD(f, 'start')
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
         rxDoc = await this.gqlQueries.get(id, clientFirst, force, onFetchFunc, params)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         rxDoc = await this.db.meta.findOne(rawId).exec()
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
   }

   // clientFirst - вернуть данные из кэша (даже если они устарели), а потом в фоне реактивно обновить
   // onFetchFunc - коллбэк, который будет вызван, когда данные будут получены с сервера
   // params - допюпараметры для RxCollectionEnum.GQL_QUERY
   async get (rxCollectionEnum, rawId, { id = null, fetchFunc, clientFirst = true, priority = 0, force = false, onFetchFunc = null, params = null } = {}) {
      const f = this.get
      const t1 = performance.now()
      // logD(f, 'start')
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
         let rxDoc = await this.getRxDoc(id, {
            fetchFunc,
            clientFirst,
            priority,
            force,
            onFetchFunc,
            params
         })
         if (!rxDoc) return null
         reactiveItem = getReactive(rxDoc)
         this.reactiveItemDbMemCache.set(id, reactiveItem)
      }
      this.store.commit('debug/addReactiveItem', { id, reactiveItem })
      assert(reactiveItem.getData, '!reactiveItem.getData' + JSON.stringify(reactiveItem))
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
         assert(data.id && data.valueString, 'bad data' + JSON.stringify(data)) // valueString не должен быть null! (cм getReactive(rxDoc).getData())
         rxDoc = await this.db.meta.atomicUpsert({ id: data.id, valueString: data.valueString })
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      if (!rxDoc) return null
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return getReactive(rxDoc).getData()
   }

   async remove (id) {
      const f = this.remove
      const t1 = performance.now()
      logD(f, 'start')
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
