import assert from 'assert'
import { Workspace, WsCollectionEnum } from 'src/system/rxdb/workspace'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { addRxPlugin, createRxDatabase, DEFAULT_UNEXECUTED_LIFETME, removeRxDatabase } from 'rxdb'
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
import { wait } from 'src/system/utils'
import { getInstanceId, globalLock, globalRelease, isLeader, systemReset } from 'src/system/services'

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
      this.initialized = false
      this.mutex = new Mutex()
      this.store = null // vuex
      this.reactiveItemDbMemCache = new ReactiveItemDbMemCache()
      addRxPlugin(require('pouchdb-adapter-idb'))
      addRxPlugin(RxDBValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      // if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)

      window.addEventListener('storage', async (event) => {
         if (event.key && event.key.in('k_rxdb_deinit_date')) { // одна из вкладок выполнила rxdb.deinit. Надо обновить коллекции
            if (this.created && event.newValue) {
               logD('localStorage k_rxdb_deinit_date event:', event)
               try {
                  assert(this.workspace && this.cache, '!this.workspace && this.cache')
                  await this.updateCollections('create')
               } catch (err) {
                  logE('cant updateCollections!', err)
                  await window.location.reload()
               }
            }
         }
      })
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
      logD(f, 'start')
      const t1 = performance.now()
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // получит юзера, запустит обработку эвентов и синхронмзацию мастерской) dummyUser - для входа без регистрации
   async init ({ userOid, dummyUser }) {
      const f = this.init
      logD(f, 'start')
      const t1 = performance.now()
      assert(this.created, '!created')
      assert(!this.initialized, '!!initialized')
      assert(userOid || dummyUser, '!userOid || dummyUser')
      try {
         await globalLock() // иначе все вкладки ломанутся запрашивать nodeCategories emojiSpheres параллельно
         await this.lock()
         this.event.init()
         // запрашиваем необходимые для работы данные (currentUser, nodeCategories, etc)
         let nodeCategories = await this.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories', { clientFirst: true })
         let emojiSpheres = await this.get(RxCollectionEnum.GQL_QUERY, 'emojiSpheres', { clientFirst: true })
         assert(nodeCategories && emojiSpheres, '!nodeCategories && emojiSpheres')
         // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возмется из кэша
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
         }
         assert(currentUser, '!currentUser!!')
         this.getCurrentUser = () => {
            return currentUser
         }
         await this.set(RxCollectionEnum.META, { id: 'authUser', valueString: JSON.stringify({ userOid, dummyUser }) })
         this.initialized = true
      } finally {
         this.release()
         globalRelease()
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, `isLeader = ${isLeader()}`)
      }
   }

   // удалит данные в rxdb (сообщит об этом другим вкладкам)
   async deinit (clearCache = true) {
      const f = this.deinit
      logD(f, 'start', this.created, clearCache, isLeader())
      const t1 = performance.now()
      try {
         await globalLock()
         await this.lock()
         // this.event.deInit()
         // this.workspace.switchOffSynchro()
         if (this.created) {
            assert(this.event && this.workspace && this.cache, 'this.events && this.workspace && this.cache')
            await this.updateCollections('recreate', clearCache ? ['workspace', 'cache'] : ['workspace'])
         } else {
            await this.updateCollections('delete', clearCache ? ['workspace', 'cache'] : ['workspace'])
            if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
            else await removeRxDatabase('rxdb', 'idb')
         }
         this.reactiveItemDbMemCache.reset()
         delete this.getCurrentUser
         this.initialized = false
      } finally {
         this.release()
         globalRelease()
         localStorage.setItem('k_rxdb_deinit_date', Date.now().toString()) // сообщаем другим вкладкам
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      }
   }

   async isInitialized (autoInitialize = true) {
      if (!this.initialized && autoInitialize) {
         // пытаемся проиницилизироваться запомненным пользователем
         let authUser = JSON.parse(await this.get(RxCollectionEnum.META, 'authUser') || 'null') // данные запоминаются после первого успешного init
         if (authUser) await this.init(authUser)
      }
      return this.initialized
   }

   async lock () {
      await this.mutex.lock()
   }

   release () {
      this.mutex.release()
   }

   async processEvent (event) {
      try {
         if (!isLeader()) return // только одна вкладка меняет rxdb по эвентам сервера
         await globalLock(false) // запускаем без рекурсии (чтобы дождалась пока отработает rxdb.deinit, synchronize ws и др)
         await this.lock()
         assert(this.store, '!this.store')
         await this.event.processEvent(event, this.store)
      } finally {
         this.release()
         globalRelease()
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
      assert(this.created, '!created!')
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
      assert(this.created, '!created!')
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
            servicesApollo,
            params
         })
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
         assert(data.id && data.valueString, 'bad data' + JSON.stringify(data)) // valueString не должен быть null! (cм getReactive(rxDoc).getData())
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
