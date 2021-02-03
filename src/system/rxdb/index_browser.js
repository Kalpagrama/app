import assert from 'assert'
import { Workspace } from 'src/system/rxdb/workspace'
import {
   WsCollectionEnum,
   LstCollectionEnum,
   RxCollectionEnum,
   rxdbOperationProxy,
   rxdbOperationProxyExec
} from 'src/system/rxdb/common'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'
import { Event } from 'src/system/rxdb/event'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { Lists, makeListCacheId } from 'src/system/rxdb/lists'
import { getReactiveDoc, ReactiveListWithPaginationFactory, updateRxDocPayload } from 'src/system/rxdb/reactive'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { cacheSchema, schemaKeyValue } from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'
import { GqlQueries } from 'src/system/rxdb/gql_query'
import { setSyncEventStorageValue } from 'src/system/services_browser'
import { getRxCollectionEnumFromId, getRawIdFromId, makeId } from 'src/system/rxdb'
import debounce from 'lodash/debounce'
import { AuthApi } from 'src/api/auth'
import { ObjectApi } from 'src/api/object'
import { wait } from 'src/system/utils'

const logDT = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.TEST)
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB)

const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк
const defaultCacheSize = 10 * 1024 * 1024 // кэш реактивных объектов
if (defaultCacheSize < 10 * 1024 * 1024) logW('TODO увеличить rxDbMemCache до 10 МБ после тестирования')

// кээширование объектов перед rxDb (rxDb  очень медленная)
class ReactiveDocDbMemCache {
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

// import memdown from 'src/system/rxdb/rxdb_vuex_adapter'
// import memdown from 'memdown'

let adapter = 'idb'
// let adapter = 'indexeddb' // глючит
// let adapter = memdown
// let adapter = 'memory'

class RxDBWrapper {
   constructor () {
      this.created = false
      this.mutex = new MutexLocal('rxdb')
      this.findMutex = new MutexLocal('rxdb-find')
      this.removeMutex = new MutexLocal('rxdb-remove')
      this.store = null // vuex
      this.reactiveDocDbMemCache = new ReactiveDocDbMemCache()
      addRxPlugin(require('pouchdb-adapter-idb'))
      // addRxPlugin(require('pouchdb-adapter-memory'))
      // addRxPlugin(require('pouchdb-adapter-indexeddb')) // глючит // IndexedDB (new) https://github.com/pouchdb/pouchdb/tree/master/packages/node_modules/pouchdb-adapter-indexeddb#differences-between-couchdb-and-pouchdbs-find-implementations-under-indexeddb
      // addRxPlugin(require('pouchdb-adapter-leveldb')) // leveldown adapters need the leveldb plugin to work
      // addRxPlugin(require('pouchdb-adapter-memory'))

      addRxPlugin(RxDBQueryBuilderPlugin)
      addRxPlugin(RxDBValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      addRxPlugin(RxDBMigrationPlugin)
      // if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)
      this.processStoreEvent = async (eventKey) => {
         // одна из вкладок создала rxdb либо выполнила rxdb.deInitGlobal(пересрздала rxdb). Надо обновить коллекции
         if (this.created) {
            const f = this.processStoreEvent
            f.nameExtra = 'processStoreEvent'
            logD(f, 'start', eventKey)
            const t1 = performance.now()
            try {
               switch (eventKey) {
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
                     throw new Error('bad event' + eventKey)
               }
            } catch (err) {
               logE('cant process rxdb event!', err)
               alert('error on processStoreEvent: ' + JSON.stringify(err))
               await window.location.reload()
               logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
            } finally {
            }
         }
      }
   }

   onRxDocDelete (id) {
      assert(id)
      assert(this.store)
      this.reactiveDocDbMemCache.del(id)
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
         localStorage.setItem('k_rxdb_last_purge_date', mutexGlobal.getInstanceId())
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async createTestDb () {
      // const dbTest = await createRxDatabase({
      //    name: 'test',
      //    adapter: 'idb',
      //    multiInstance: true,
      //    eventReduce: false
      // });
      const dbTest = this.db
      await dbTest.collection({ name: 'cache_test', schema: cacheSchema })
      await dbTest.cache_test.remove();
      await dbTest.collection({ name: 'cache_test', schema: cacheSchema })

      // let collection = dbTest.cache_test
      let collection = dbTest.cache

      let allObjects = await ObjectApi.objectListAllTest()
      logDT('allObjects', allObjects.length)
      let f = this.createTestDb
      let tmpObj
      const findCycle = async () => {
         for (let obj of allObjects){
            let t = performance.now()
            let id = RxCollectionEnum.OBJ + '::' + obj.oid + '::' + JSON.stringify({})
            let finded1 = await collection.find({selector: {'cached.data.name': obj.name}}).exec()
            let finded2 = await collection.findOne(id).exec()
            logDT(f, `find complete: ${Math.floor(performance.now() - t)} msec`, finded1.length, finded2 ? 1 : 0)
            // await wait(5)
         }
      }
      const insert = async (prefix, from, to) => {
         tmpObj = allObjects[from]

         let inserted = []
         for (let dbItem of allObjects.slice(from, to)) {
            let id = RxCollectionEnum.OBJ + '::' + prefix + dbItem.oid + '::' + JSON.stringify({})
            let plainDoc = {
               id,
               props: {
                  notEvict: false,
                  oid: 'kjnlkjhqwoiufhsakljdfhalskdjfhsalkdfjhaslkdfjhaslkdfjhaslkdfhjaskldjfhalksjhflaksdfhiowuqrhfklsajdfh',
                  rxCollectionEnum: RxCollectionEnum.OBJ,
                  mangoQuery: { selector: { oid: 'asdalkhfalskjdfhalskdjfhaklsjghsklfjghkldsjghkdsfjghklasjhflkjhsadfkljhsadfksajdhflksadjfhasdfklsjdhf' } }
               },
               cached: { data: dbItem }
            }
            inserted.push(plainDoc)
         }
         let oids = inserted.map(item => item.id)
         let updatedRxDocs = await collection.find({ selector: { id: { $in: oids } } }).exec()
         // if (updatedRxDocs.length) logDT(f, 'updatedRxDocs: ', updatedRxDocs.length)
         for (let updated of updatedRxDocs) {
            let itemForUpdate = inserted.find(item => item.id === updated.id)
            assert(itemForUpdate, '!inserted')
            await collection.atomicUpsert(itemForUpdate)
            inserted = inserted.filter(it => it.id !== updated.id)
         }
         let { success, error } = collection.bulkInsert(inserted) // оставшиеся вставляем
      }
      // findCycle()
      for (let prefix = 0; prefix < 1; prefix++){
         let curr = 0
         while (curr <= allObjects.length) {
            let t = performance.now()
            let next = Math.max(0, curr) + 100
            await insert(prefix, curr, curr + 100)
            curr = next
            // await wait(100)
            logDT(f, `${prefix}:${curr} cycle complete: ${Math.floor(performance.now() - t)} msec`)
         }
      }

      logDT(f, 'complete')
   }

   async create (store) {
      const f = this.create
      logD(f, 'start')
      const t1 = performance.now()
      assert(!this.created, 'this.created')
      try {
         await mutexGlobal.lock('rxdb::create')
         this.store = store
         this.db = await createRxDatabase({
            name: 'kalpadb',
            adapter,
            multiInstance: true, // <- multiInstance (optional, default: true)
            eventReduce: false, // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
            pouchSettings: { revs_limit: 1 }
         })
         await this.purgeDb() // очистит бд от старых данных

         this.reactiveDocDbMemCache.reset()
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
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } catch (err) {
         logE(f, 'ошибка при создания RxDatabase! очищаем и пересоздаем!', err)
         if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
         else await removeRxDatabase('kalpadb', adapter)
         throw err
      } finally {
         await mutexGlobal.release('rxdb::create')
      }
   }

   async updateCollections (operation, collections = ['workspace', 'cache']) {
      assert(operation.in('create', 'delete', 'recreate'))
      const f = this.updateCollections
      const t1 = performance.now()
      logD(f, 'start')
      if (operation.in('delete', 'recreate')) {
         if (this.db.meta) await rxdbOperationProxyExec(this.db.meta, 'remove')
      }
      if (operation.in('create', 'delete', 'recreate')) {
         if (this.db.meta) await rxdbOperationProxyExec(this.db.meta, 'destroy')
      }
      if (operation.in('create', 'recreate')) {
         await this.db.collection({ name: 'meta', schema: schemaKeyValue })
      }
      for (let collection of collections) {
         if (this[collection]) await this[collection].updateCollections(operation)
      }
      if (!(await this.get(RxCollectionEnum.META, 'rxdbCreateDate', { beforeCreate: true }))) { // эта вкладка первой инициализироваля rxdb
         await this.set(RxCollectionEnum.META, {
            id: 'rxdbCreateDate',
            valueString: Date.now().toString()
         }, { beforeCreate: true })
         setSyncEventStorageValue('k_rxdb_create_date', Date.now().toString()) // сообщаем другим вкладкам
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
         await this.lock('rxdb::init')
         await this.event.init()
         let authUser = JSON.parse(await this.get(RxCollectionEnum.META, 'authUser') || 'null') // данные запоминаются после первого успешного init на одной из вкладок
         assert(authUser, 'authUser')
         let { userOid, dummyUser } = authUser
         assert(userOid || dummyUser, '!userOid || dummyUser')
         // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возьмется из кэша
         let currentUser
         if (userOid) {
            currentUser = await this.get(RxCollectionEnum.OBJ, userOid, {
               notEvict: true,
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
            // assert(!dummyUser.oid)
            // dummyUser.oid = 'dummyUser_oid_' + Date.now()
            // let fetchCurrentUserFunc = async () => {
            //    return {
            //       notEvict: true, // живет вечно
            //       item: dummyUser,
            //       actualAge: 'infinity' // dummyUser не устаревает
            //    }
            // }
            // assert(dummyUser.oid, 'dummyUser.oid')
            // currentUser = await this.get(RxCollectionEnum.OBJ, dummyUser.oid, {
            //    fetchFunc: fetchCurrentUserFunc,
            //    force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
            //    clientFirst: false // обязательно брать из fetchFunc
            // })
            currentUser = dummyUser
            assert(currentUser, '!currentUser (dummyUser)!!') // должен быть в rxdb после init
         }

         assert(currentUser, '!currentUser') // init вызывается только после успешного initGlobal (а он заполнят юзера)
         this.getCurrentUser = () => {
            return currentUser
         }
         this.initialized = true

         // this.createTestDb()

         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } catch (err) {
         logE('cant init rxdb. err = ', err)
      } finally {
         this.release()
      }
   }

   async deInit (fromDeinitGlobal = false) {
      const f = this.deInit
      const t1 = performance.now()
      try {
         await this.lock('rxdb::deInit')
         logD(f, 'start', fromDeinitGlobal)
         assert(this.created, '!created')
         if (fromDeinitGlobal) await this.event.deInit() // подписку отменяем только 1 раз
         this.workspace.switchOffSynchro()
         delete this.getCurrentUser
         this.reactiveDocDbMemCache.reset()
         if (fromDeinitGlobal) await this.updateCollections('recreate', ['workspace', 'cache']) // fromDeinitGlobal - кейс только для  deInitGlobal
         this.initialized = false
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
      }
   }

   // запускается единожды после регистрации
   async initGlobal ({ userOid, dummyUser }) {
      const f = this.initGlobal
      logD(f, 'start')
      const t1 = performance.now()
      assert(this.created, '!created') // нужна коллекция META
      assert(!(await this.isInitializedGlobal()), '!!this.isInitializedGlobal()')
      assert(userOid || dummyUser, '!userOid || dummyUser')
      try {
         await mutexGlobal.lock('rxdb::initGlobal')
         await this.set(RxCollectionEnum.META, { id: 'authUser', valueString: JSON.stringify({ userOid, dummyUser }) })
         await this.init() // инициализируем текущую вкладку
         setSyncEventStorageValue('k_rxdb_init_global_date', Date.now().toString()) // сообщаем другим вкладкам
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         await mutexGlobal.release('rxdb::initGlobal')
      }
   }

   // удалит данные в rxdb (сообщит об этом другим вкладкам)
   async deInitGlobal () {
      const f = this.deInitGlobal
      logD(f, 'start')
      const t1 = performance.now()
      try {
         await mutexGlobal.lock('rxdb::deinitGlobal')
         if (this.created) await this.deInit(true) // деинициализируем текущую вкладку
         setSyncEventStorageValue('k_rxdb_deinit_global_date', Date.now().toString()) // сообщаем другим вкладкам
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } catch (err) {
         logE(f, 'err on deInitGlobal! remove db!', err)
         if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
         else await removeRxDatabase('kalpadb', adapter)
         throw err
      } finally {
         await mutexGlobal.release('rxdb::deinitGlobal')
      }
   }

   async isInitializedGlobal () {
      assert(this.created, '!created')
      let authUser = await this.get(RxCollectionEnum.META, 'authUser') // данные запоминаются после первого успешного init на одной из вкладок
      return !!authUser && localStorage.getItem('k_token') // k_token нужен для gql-запросов
   }

   async lock (lockOwner) {
      await this.mutex.lock(lockOwner)
   }

   release () {
      this.mutex.release()
   }

   async processEvent (event) {
      assert(this.created, 'cant processEvent! !this.created')
      const f = this.processEvent
      const t1 = performance.now()
      logD(f, 'start', event)
      if (mutexGlobal.isLeader() || event.type === 'PROGRESS') {
         logD(f, 'try to process event...')
         try {
            await mutexGlobal.lock('rxdb::processEvent')
            await this.lock('rxdb::processEvent')// (чтобы дождалась пока отработает rxdb.deInitGlobal, synchronize ws и др)
            assert(this.initialized, '! this.initialized1 !')
            assert(event.id, '!event.id')
            assert(this.store, '!this.store')
            await this.event.processEvent(event, this.store)
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         } finally {
            this.release()
            await mutexGlobal.release('rxdb::processEvent')
         }
      } else {
         logD(f, 'event ignored', event)
      }
   }

   // вернет список из objectFull
   // async find___ (mangoQuery) {
   //    const f = this.find
   //    const t1 = performance.now()
   //    logD(f, 'start', mangoQuery)
   //    mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
   //
   //    let result = { items: [], count: 0, totalCount: 0, nextPageToken: null, prevPageToken: mangoQuery.pageToken }
   //    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
   //    let pageToken = mangoQuery.pageToken || { indx: 0, id: null }
   //    let populateObjects = mangoQuery.populateObjects
   //    let limit = parseInt(mangoQuery.limit)
   //    delete mangoQuery.pageToken // мешает нормальному кэшированию запросов в findInternal
   //    delete mangoQuery.populateObjects // мешает нормальному кэшированию запросов в findInternal
   //    delete mangoQuery.limit // мешает нормальному кэшированию запросов в findInternal
   //
   //    if (!limit) limit = populateObjects ? 88 : 8888
   //    let startIndx = pageToken.indx
   //    let nextIndx = startIndx + limit
   //
   //    if (rxCollectionEnum in WsCollectionEnum) {
   //       if (pageToken && pageToken.id) mangoQuery.startkey = pageToken.id
   //       else if (pageToken && pageToken.indx) mangoQuery.skip = pageToken.indx
   //       result.items = (await this.findInternal(mangoQuery)).items
   //       result.count = result.items.length
   //       result.totalCount = 100500
   //       result.nextPageToken = result.count ? {
   //          indx: nextIndx,
   //          id: result.items[result.items.length - 1].id
   //       } : null
   //
   //       const result = await (new ReactiveListWithPaginationFactory()).create(rxQuery)
   //
   //    } else if (rxCollectionEnum in LstCollectionEnum) {
   //       let objectShortList = await this.findInternal(mangoQuery)
   //       let objectShortItemsLimit = objectShortList.items.slice(startIndx, nextIndx)
   //       let objectShortItemsPrefetch = objectShortList.items.slice(nextIndx, nextIndx + 3) // упреждающее чтение
   //       if (populateObjects) {
   //          if (rxCollectionEnum === RxCollectionEnum.LST_FEED) {
   //             // запрашиваем разом (см. objects.js) все полные сущности (после этого они будут в кэше)
   //             const itemsFull = await Promise.all(
   //                objectShortItemsLimit.reduce((accumulator, { object, subject }) => {
   //                   accumulator.push(this.get(RxCollectionEnum.OBJ, object.oid, { clientFirst: true }))
   //                   // accumulator.push(this.get(RxCollectionEnum.OBJ, subject.oid, { clientFirst: true }))
   //                   return accumulator
   //                }, [])
   //             )
   //             result.items = cloneDeep(objectShortItemsLimit)
   //             for (let item of result.items) {
   //                item.object = await this.get(RxCollectionEnum.OBJ, item.object.oid, { clientFirst: true }) || item.object
   //             }
   //             logD('asdasdas', result.items)
   //          } else {
   //             // запрашиваем разом (см. objects.js) все полные сущности (после этого они будут в кэше)
   //             result.items = await Promise.all(objectShortItemsLimit.map(objShort => {
   //                logD('objShort=', objShort)
   //                return this.get(RxCollectionEnum.OBJ, objShort.oid, { clientFirst: true })
   //             }))
   //             objectShortItemsPrefetch.map(objShort => this.get(RxCollectionEnum.OBJ, objShort.oid, {
   //                clientFirst: true,
   //                priority: 1
   //             })) // в фоне делаем упреждающее чтение
   //             result.items = result.items.filter(obj => !!obj)
   //          }
   //       } else result.items = objectShortItemsLimit
   //       result.count = result.items.length
   //       result.totalCount = objectShortList.items.length
   //       result.nextPageToken = objectShortList.items[nextIndx] ? {
   //          indx: nextIndx,
   //          id: objectShortList.items[nextIndx].oid
   //       } : null
   //    }
   //    // logD(f, `findInternal complete: ${Math.floor(performance.now() - tx)} msec`)
   //    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, result)
   //    return result
   // }

   // для LstCollectionEnum вернет список из objectShort. для WsCollectionEnum - полные сущности
   // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
   async find (mangoQuery, autoNext = true) {
      assert(this.created, 'cant find! !this.created')
      const f = this.find
      const t1 = performance.now()
      logD(f, 'start', mangoQuery)
      mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
      assert(!mangoQuery.pageToken, 'mangoQuery.pageToken')
      try {
         await this.findMutex.lock('rxdb::findInternal') // нужно тк иногда запросы за одной и той же сущностью прилетают друг за другом и начинают выполняться "параллельно" (при этом не срабатывает reactiveDocDbMemCache)
         assert(this.initialized, '! this.initialized2 !')
         const queryId = JSON.stringify(mangoQuery)
         assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + queryId)
         let findResult
         let cachedReactiveList = this.reactiveDocDbMemCache.get(queryId)
         // logD(f, 'addFindResult')
         if (cachedReactiveList) findResult = cachedReactiveList
         if (!findResult) {
            // mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
            let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
            assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
            if (rxCollectionEnum in WsCollectionEnum) {
               // mangoQuery.selector = { rxCollectionEnum: WsCollectionEnum.WS_ANY }
               let rxQuery = await this.workspace.find(mangoQuery)
               findResult = await (new ReactiveListWithPaginationFactory()).create(rxQuery)
               assert(findResult, '!reactiveList')
            } else if (rxCollectionEnum in LstCollectionEnum) {
               let populateFunc = async (itemsForPopulate, itemsForPrefetch, reactiveListFulFilled) => {
                  const f = populateFunc
                  f.nameExtra = 'populateFunc'
                  // logD(f, 'start', itemsForPopulate.length, itemsForPrefetch.length)
                  const t1 = performance.now()
                  assert(itemsForPopulate && itemsForPrefetch)
                  let populatedItems
                  if (rxCollectionEnum === RxCollectionEnum.LST_FEED) {
                     let promises = itemsForPopulate.map(event => {
                        let f = async () => {
                           if (reactiveListFulFilled) {
                              let fulfilled = reactiveListFulFilled.find(eventFull => eventFull.id === event.id)
                              if (fulfilled) return fulfilled
                           }
                           let copyEvent = cloneDeep(event) // не меняем исходную ленту(она реактивна)
                           let populatedObject = await this.get(RxCollectionEnum.OBJ, event.object.oid, { clientFirst: true }) || event.object
                           // copyEvent.object = populatedObject // todo перейти на copyEvent.populatedObject
                           copyEvent.populatedObject = populatedObject
                           return copyEvent
                        }
                        return f()
                     })
                     populatedItems = await Promise.all(promises)
                  } else {
                     let promises = itemsForPopulate.map(topObject => {
                        // logD('topObject=', topObject)
                        if (reactiveListFulFilled) {
                           let fulfilled = reactiveListFulFilled.find(itemFull => itemFull.oid === topObject.oid)
                           if (fulfilled) return fulfilled
                        }
                        if (!topObject.oid) {
                           logD('asdasdasdasdasd')
                        }
                        return this.get(RxCollectionEnum.OBJ, topObject.oid, { clientFirst: true })
                           .then(populatedObject => {
                              let topObjectCopy = cloneDeep(topObject) // не меняем исходную ленту(она реактивна)
                              topObjectCopy.populatedObject = populatedObject
                              return topObjectCopy
                              // return populatedObject
                           })
                     })
                     populatedItems = await Promise.all(promises)
                     if (itemsForPrefetch) {
                        itemsForPrefetch.map(objShort => this.get(RxCollectionEnum.OBJ, objShort.oid, {
                           clientFirst: true,
                           priority: 1
                        })) // в фоне делаем упреждающее чтение
                     }
                  }
                  assert(populatedItems && Array.isArray(populatedItems))
                  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
                  return populatedItems.filter(obj => !!obj)
               }
               let paginateFunc = async (pageToken, pageSize) => {
                  assert(pageToken && pageSize, 'bad pagination params')
                  let paginationMangoQuery = cloneDeep(mangoQuery)
                  paginationMangoQuery.pagination = { pageSize, pageToken }
                  let rxDocPagination = await this.lists.find(paginationMangoQuery)
                  return rxDocPagination
               }
               let propsCacheItemId = makeId(RxCollectionEnum.LOCAL, 'ReactiveList.props', makeListCacheId(mangoQuery)) // до удаления populateObjects
               let populateObjects = mangoQuery.populateObjects
               delete mangoQuery.populateObjects // мешает нормальному кэшированию
               mangoQuery.pagination = {
                  pageSize: mangoQuery.selector.rxCollectionEnum === RxCollectionEnum.LST_FEED ? 25 : 1000 * 1000,
                  pageToken: null
               }
               let propsReactive = await this.get(RxCollectionEnum.LOCAL, propsCacheItemId, {
                  fetchFunc: async () => {
                     return {
                        item: {}, // пустой объект для начальной иницализации props
                        actualAge: 'infinity'
                     }
                  }
               })
               if (propsReactive.currentPageToken && propsReactive.currentPageSize) {
                  mangoQuery.pagination = {
                     pageSize: propsReactive.currentPageSize,
                     pageToken: propsReactive.currentPageToken
                  }
               }
               let rxDocInitial = await this.lists.find(mangoQuery) // начальный запрос (от него пойдет пагинация)
               findResult = await (new ReactiveListWithPaginationFactory()).create(rxDocInitial, populateObjects ? populateFunc : null, paginateFunc, propsReactive)
            } else {
               throw new Error('bad collection: ' + rxCollectionEnum)
            }
            assert(findResult, '!findResult' + JSON.stringify(findResult))
            this.reactiveDocDbMemCache.set(queryId, findResult)
         }
         await findResult.gotoCurrent()
         if (autoNext && findResult.items.length === 0) await findResult.next()
         // this.store.commit('debug/addFindResult', { queryId, findResult })
         this.store.commit('debug/addFindResult', { queryId, findResult })
         assert(findResult && findResult.next, '!findResult.next')
         return findResult
         // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, result)
      } finally {
         this.findMutex.release()
      }
   }

   async getRxDoc (id, {
      fetchFunc,
      notEvict = false,
      clientFirst = true,
      priority = 0,
      force = false,
      onFetchFunc = null,
      params = null,
      beforeCreate = false
   } = {}) {
      assert(beforeCreate || this.created, 'cant getRxDoc! !this.created')
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
         rxDoc = await this.objects.get(id, notEvict, priority, clientFirst, force, onFetchFunc)
      } else if (rxCollectionEnum === RxCollectionEnum.GQL_QUERY) {
         rxDoc = await this.gqlQueries.get(id, clientFirst, force, onFetchFunc, params)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         rxDoc = await rxdbOperationProxyExec(this.db.meta, 'findOne', rawId)
      } else if (rxCollectionEnum === RxCollectionEnum.LOCAL) {
         assert(fetchFunc)
         rxDoc = await this.cache.get(id, fetchFunc)
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
   }

   // clientFirst - вернуть данные из кэша (даже если они устарели), а потом в фоне реактивно обновить
   // onFetchFunc - коллбэк, который будет вызван, когда данные будут получены с сервера
   // params - допюпараметры для RxCollectionEnum.GQL_QUERY
   async get (rxCollectionEnum, idOrRawId, {
      id = null,
      fetchFunc,
      notEvict = false,
      clientFirst = true,
      priority = 0,
      force = false,
      onFetchFunc = null,
      params = null,
      beforeCreate = false
   } = {}) {
      assert(beforeCreate || this.created, 'cant get! !this.created')
      const f = this.get
      const t1 = performance.now()
      // logD(f, 'start', rxCollectionEnum, idOrRawId)
      if (!id) {
         assert(idOrRawId, 'idOrRawId!')
         if (idOrRawId.includes('::')) {
            id = idOrRawId
         } else {
            assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
            id = makeId(rxCollectionEnum, idOrRawId, params)
         }
      }
      assert(id, 'bad id: ' + id)
      rxCollectionEnum = getRxCollectionEnumFromId(id) // иногда вызывается без rxCollectionEnum (когда известен только id)
      let reactiveDoc
      if (!force) { // вернем из быстрого кэша реактивных элементов
         let cachedReactiveItem = this.reactiveDocDbMemCache.get(id)
         if (cachedReactiveItem) {
            if ([RxCollectionEnum.OBJ, RxCollectionEnum.GQL_QUERY].includes(rxCollectionEnum)) {
               if (this.cache.isActual(id)) reactiveDoc = cachedReactiveItem // элемент из RxCollectionEnum.OBJ, RxCollectionEnum.GQL_QUERY может устареть (тогда надо запросить заново)
            } else reactiveDoc = cachedReactiveItem // остальные элементы не устаревают
         }
      }
      if (!reactiveDoc) {
         let rxDoc = await this.getRxDoc(id, {
            fetchFunc,
            notEvict,
            clientFirst,
            priority,
            force,
            onFetchFunc,
            params,
            beforeCreate
         })
         if (!rxDoc) return null
         reactiveDoc = getReactiveDoc(rxDoc)
         this.reactiveDocDbMemCache.set(id, reactiveDoc)
      }
      this.store.commit('debug/addReactiveItem', { id, reactiveItem: reactiveDoc.getPayload() })
      return reactiveDoc.getPayload()
   }

   // actualAge - актуально только для кэша
   async set (rxCollectionEnum, data, { actualAge, notEvict = false, beforeCreate = false } = {}) {
      // notice! блокировать нельзя тк возможен дедлок! вызывается ws.set, а он ждет synchro, а она ждет rxdb.set
      assert(beforeCreate || this.created, 'cant set! !this.created')
      const f = this.set
      // logD(f, 'start', rxCollectionEnum, data, { actualAge, notEvict })
      const t1 = performance.now()
      assert(data, '!data')
      // assert(!data.wsItemType, '!!data.wsItemType') // передается отдельно от item
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      let rxDoc
      if (rxCollectionEnum in WsCollectionEnum) {
         data.wsItemType = data.wsItemType || rxCollectionEnum
         assert(data.wsItemType === rxCollectionEnum, '!data.wsItemType === rxCollectionEnum')
         rxDoc = await this.workspace.set(data)
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         let id = makeId(rxCollectionEnum, data.oid)
         rxDoc = await this.cache.set(id, data, actualAge, notEvict)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         assert(data.id && data.valueString, 'bad data' + JSON.stringify(data))
         rxDoc = await rxdbOperationProxyExec(this.db.meta, 'atomicUpsert', { id: data.id, valueString: data.valueString })
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      if (!rxDoc) return null
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return getReactiveDoc(rxDoc).getPayload()
   }

   async remove (id) {
      assert(this.created, 'cant remove! !this.created')
      alert('delete!!!!!!' + id)
      const f = this.remove
      const t1 = performance.now()
      try {
         await this.removeMutex.lock('rxdb::remove')
         logD(f, 'start')
         let collection = getRxCollectionEnumFromId(id)
         if (collection in WsCollectionEnum) {
            await this.workspace.remove(id)
         } else {
            throw new Error('bad id!!' + id)
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.removeMutex.release()
      }
   }

   // уберет со всех лент объект или все объекты определенного автора
   async hideObjectOrSource (oid, authorOid) {
      assert(this.created, 'cant find! !this.created')
      await this.lists.hideObjectOrSource(oid, authorOid)
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
   rxdbWrapper,
   rxdbWrapper as rxdb,
   getReactiveDoc
}
