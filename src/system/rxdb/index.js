import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb/plugins/core'
import { getRxStorageLoki } from 'rxdb/plugins/lokijs'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
// import { RxDBAjvValidatePlugin } from 'rxdb/plugins/ajv-validate'
// import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'

import { assert } from 'src/system/common/utils'
import { Workspace } from 'src/system/rxdb/workspace'
import {
   LstCollectionEnum,
   RxCollectionEnum,
   rxdbOperationProxy,
   rxdbOperationProxyExec,
   WsCollectionEnum
} from 'src/system/rxdb/common'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { Event } from 'src/system/rxdb/event'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { Lists } from 'src/system/rxdb/lists'
import { getReactive, ReactiveListWithPaginationFactory } from 'src/system/rxdb/reactive'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { schemaKeyValue } from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'
import { GqlQueries } from 'src/system/rxdb/gql_query'
import { deleteIndexedDb, setSyncEventStorageValue, systemInit } from 'src/system/services'
import { reactive } from 'vue'
import { Platform } from 'quasar'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB)

// in the browser, we want to persist data in IndexedDB, so we use the indexeddb adapter.
const LokiIncrementalIndexedDBAdapter = require('lokijs/src/incremental-indexeddb-adapter');

const rxdbVer = 2

const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк
const defaultCacheSize = 10 * 1024 * 1024 // кэш реактивных объектов
if (defaultCacheSize < 10 * 1024 * 1024) logW('TODO увеличить rxDbMemCache до 10 МБ после тестирования')

function getRxCollectionEnumFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length >= 2, 'bad id!' + id)
   let rxCollection = parts[0]
   assert(rxCollection in RxCollectionEnum, 'bad rxCollection' + rxCollection)
   return rxCollection
}

function getRawIdFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length >= 2, 'bad id!' + id)
   let rawId = parts[1]
   assert(rawId, 'bad id' + id)
   return rawId
}

function makeId (rxCollectionEnum, rawId, params = null) {
   assert(rawId, '!rawId')
   assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum' + rxCollectionEnum)
   assert(!rawId.includes('::'), 'bad rawId' + rawId)
   params = params || {}
   return rxCollectionEnum + '::' + rawId + '::' + JSON.stringify(params)
}

// кээширование объектов перед rxDb (rxDb  очень медленная) (PS уже неактуально (используется LokiJS))
// todo можно перейти чисто на rxdb! (используется LokiJS)
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

class RxDBWrapper {
   constructor () {
      this.created = false
      this.mutex = new MutexLocal('rxdb')
      this.findMutex = new MutexLocal('rxdb-find')
      this.removeMutex = new MutexLocal('rxdb-remove')
      this.store = null // vuex
      this.reactiveDocDbMemCache = new ReactiveDocDbMemCache()
      this.onRxDocDelete = (id) => {
         assert(id)
         this.reactiveDocDbMemCache.del(id)
      }
      this.lock = async (lockOwner) => { await this.mutex.lock(lockOwner) }
      this.release = () => { this.mutex.release() }

      addRxPlugin(RxDBQueryBuilderPlugin)
      // addRxPlugin(RxDBAjvValidatePlugin)
      // addRxPlugin(RxDBValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      addRxPlugin(RxDBMigrationPlugin)
      addRxPlugin(RxDBUpdatePlugin);
      if (process.env.DEV) {
         logW('disable RxDBDevModePlugin!')
         addRxPlugin(RxDBDevModePlugin)
      }
      this.workspace = new Workspace()
      this.cache = new Cache()
      this.objects = new Objects()
      this.lists = new Lists()
      this.event = new Event()
      this.gqlQueries = new GqlQueries()
      this.currentState = reactive({ authToken: null, authUser: null, currentSettings: null, categoryOrder: [] })
      this.getAuthToken = () => this.currentState.authToken
      this.getCurrentUser = () => this.currentState.authUser
      this.getCurrentSettings = () => this.currentState.currentSettings
      this.getCategoryOrder = () => this.currentState.categoryOrder
      this.processStoreEvent = async (eventKey) => {
         // одна из вкладок пересоздала rxdb либо выполнила rxdb.setAuthData. Надо обновить
         if (this.created) {
            const f = this.processStoreEvent
            f.nameExtra = 'processStoreEvent'
            logD(f, 'start', eventKey)
            const t1 = performance.now()
            try {
               switch (eventKey) {
                  case 'k_rxdb_set_auth_data':
                     logT(f, 'на другой вкладке произошла авторизация', eventKey)
                     await this.init()
                     break
                  case 'k_rxdb_ws_ready':
                     logT(f, 'на другой вкладке произошла синхронизация мастерской', eventKey)
                     this.store.commit('core/stateSet', ['wsReady', true])
                     break
                  default:
                     throw new Error('bad event' + eventKey)
               }
            } catch (err) {
               logC('cant process rxdb StoreEvent!', eventKey, err)
            }
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         }
      }
   }

   async create (store) {
      const f = this.create
      logT(f, 'start')
      assert(!this.db && !this.rxStorage && !this.store)
      assert(!this.clearInProgress)
      const t1 = performance.now()
      try {
         await mutexGlobal.lock('rxdb::create')
         await this.lock('create')
         this.store = store
         this.rxStorage = getRxStorageLoki({
            adapter: new LokiIncrementalIndexedDBAdapter()
            // * Do not set lokiJS persistence options like autoload and autosave,
            // * RxDB will pick proper defaults based on the given adapter
         })
         this.db = await createRxDatabase({
            name: 'kalpadb',
            storage: this.rxStorage,
            // для нативных приложений multiInstance=false. для web - multiInstance=true
            multiInstance: !Platform.is.capacitor // <- multiInstance (optional, default: true)
            // eventReduce: false // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
            // pouchSettings: { revs_limit: 1 }
         })
         await this.db.addCollections({
            meta: {
               schema: schemaKeyValue,
               migrationStrategies: {
                  1: oldDoc => oldDoc,
               }
            }
         })

         this.reactiveDocDbMemCache.reset()
         await this.workspace.create(this.db, store)
         await this.cache.create(this.db)
         await this.objects.create(this.cache)
         await this.lists.create(this.cache)
         await this.event.create(this.workspace, this.objects, this.lists, this.cache)
         await this.gqlQueries.create(this.cache)
         if (!(await this.get(RxCollectionEnum.META, 'rxdbCreateDate', { beforeCreate: true }))) { // первый запуск! эта вкладка первой инициализироваля rxdb
            await this.set(RxCollectionEnum.META, { id: 'rxdbCreateDate', value: Date.now() }, { beforeCreate: true })
            await this.set(RxCollectionEnum.META, { id: 'rxdbVer', value: rxdbVer }, { beforeCreate: true })
            await this.set(RxCollectionEnum.META, { id: 'categoryOrder', value: [] }, { beforeCreate: true })
         } else { // не первый запуск
            let currentDataVer = await this.get(RxCollectionEnum.META, 'rxdbVer', { beforeCreate: true }) || 0
            if (currentDataVer !== rxdbVer) throw new Error(`Rxdb data created in outdated version! currentDataVer=${currentDataVer}, rxdbVer=${rxdbVer}`)
         }
         this.getAuthData = async () => {
            assert(this.created, '!created')
            let authData = await this.get(RxCollectionEnum.META, 'authData') // данные запоминаются после первого успешного setAuthData на одной из вкладок
            return authData || {authToken: null, userOid: null, dummyUser: null}
         }
         this.clearAuthData = async () => {
            assert(this.created, '!created')
            let authDataOld = await this.getAuthData()
            let authData = {
               authToken: null,
               userOid: null,
               dummyUser: authDataOld.dummyUser, // оставляем! нужно чтобы какой-то юзер был всегда
            }
            await this.set(RxCollectionEnum.META, { id: 'authData', value: authData })
            this.currentState.authToken = authData.authToken
            this.currentState.authUser = authData.dummyUser
            setSyncEventStorageValue('k_rxdb_set_auth_data', Date.now().toString()) // сообщаем другим вкладкам (они вызовут this.init())
         }
         this.setAuthData = async ({ authToken, userOid, dummyUser }) => {
            const f = { nameExtra: 'rxdb::setAuthData' }
            logD(f, 'start')
            const t1 = performance.now()
            assert(this.created, '!created') // нужна коллекция META
            assert(authToken || userOid || dummyUser, 'authToken || userOid || dummyUser')
            try {
               await this.lock('setAuthData')
               let authDataOld = await this.getAuthData()
               let authData = {
                  authToken: authToken || authDataOld.authToken, // чтобы не перезатереть например authToken (устанавливается раньше чем userOid)
                  userOid: userOid || authDataOld.userOid,
                  dummyUser: dummyUser || authDataOld.dummyUser,
               }
               await this.set(RxCollectionEnum.META, { id: 'authData', value: authData })
               setSyncEventStorageValue('k_rxdb_set_auth_data', Date.now().toString()) // сообщаем другим вкладкам (они вызовут this.init())
               logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
            } finally {
               this.release()
            }
            await this.init() // будет запрошен user и settings
         }
         this.created = true
         logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
         await mutexGlobal.release('rxdb::create')
      }
      await this.init(false) // будет заполнено только из кэша(в сеть за данными не пойдет)
   }

   // получить юзера, запустить обработку эвентов и синхронизацию мастерской (dummyUser - для входа без регистрации). вызывается в systemInit, а так же в this.clear и this.setAuthData
   // networkEnable === false - до инициализации apollo (apollo инициализируется после rxdb)
   async init (networkEnable = true) {
      const f = this.init
      logT(f, 'start',)
      const t1 = performance.now()
      try {
         await this.lock('setup')
         this.reactiveDocDbMemCache.reset() // init вызывается в systemInit. нужно очистить кэш в памяти
         let { authToken, userOid, dummyUser } = await this.getAuthData()
         this.currentState.authToken = authToken
         if (userOid) {
            let currentUserDbFetched, currentUserDb
            currentUserDb = await this.get(RxCollectionEnum.OBJ, userOid, {
               notEvict: true,
               priority: networkEnable ? 0 : -1, // если аполло не инициализирован - берем только из кэша
               force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
               clientFirst: true, // если в кэше есть данные - то они вернутся моментально (и обновятся в фоне)
               onFetchFunc: async (oldVal, newVal) => { // будет вызвана при получении данных от сервера
                  if (currentUserDb && this.getCurrentUser) this.workspace.switchOnSynchro(this.getCurrentUser()) // в кэше есть данные (onFetchFunc сработает после this.getCurrentUser = ...)
                  else currentUserDbFetched = true // если данных в кэше не было, то onFetchFunc выпольнится раньше, чем this.getCurrentUser = ...
               }
            })
            this.currentState.authUser = currentUserDb
            if (currentUserDbFetched) this.workspace.switchOnSynchro(this.getCurrentUser()) // onFetchFunc сработало до этого момента(в кэше не было данных(см clientFirst))
         } else if (dummyUser) {
            assert(dummyUser, '!dummyUser')
            dummyUser.profile.tutorial = {
               main: true,
               content_first: true,
               node_first: true,
               joint_first: true,
               workspace_first: true,
               workspace_upload: true,
               workspace_article: true
            }
            this.currentState.authUser = getReactive(dummyUser)
         } else this.currentState.authUser = null

         this.currentState.currentSettings = await this.get(RxCollectionEnum.GQL_QUERY, 'settings', {
            priority: networkEnable ? 0 : -1 // если аполло не инициализирован - берем только из кэша
         })
         assert(!networkEnable || this.currentState.currentSettings)
         this.currentState.categoryOrder = await this.get(RxCollectionEnum.META, 'categoryOrder')
         assert(this.currentState.categoryOrder)
         logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
      }
   }

   // очистит данные, но не тронет базу
   async clear () {
      const f = this.clear
      const t1 = performance.now()
      logT(f, 'start')
      try {
         await mutexGlobal.lock('rxdb::clear') // todo это надо???
         await this.lock('clear')
         assert(this.created)
         assert(this.db && this.db.meta)
         this.clearInProgress = true
         // // todo возможно будут проблемы тк gui расчитывает на authUser (может не надо обнулять тк this.init() их потом обновит)
         // this.currentState.authToken = null
         // this.currentState.authUser = null
         // this.currentState.currentSettings = null
         // this.currentState.categoryOrder = []
         await this.gqlQueries.clear()
         await this.event.clear()
         await this.lists.clear()
         await this.cache.clear()
         await this.objects.clear()
         await this.workspace.clear()
         this.reactiveDocDbMemCache.reset()

         let persistentIds = [
            makeId(RxCollectionEnum.META, 'rxdbCreateDate'),
            makeId(RxCollectionEnum.META, 'rxdbVer'),
            makeId(RxCollectionEnum.META, 'authData'),
            makeId(RxCollectionEnum.META, 'categoryOrder')
         ]
         await rxdbOperationProxy(this.db.meta, 'find', { selector: { id: { $nin: persistentIds} } }).remove() // удаляем все кроме persistentIds
      } finally {
         delete this.clearInProgress
         this.release()
         await mutexGlobal.release('rxdb::clear')
      }
      await this.init() // getCurrentUser | getCurrentSettings | getCategoryOrder
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
            await this.lock('rxdb::processEvent')// (чтобы дождалась пока отработает rxdb.create, synchronize ws и др)
            assert(this.getCurrentUser(), '! this.getCurrentUser !')
            assert(event.id, '!event.id')
            assert(this.store, '!this.store')
            await this.event.processEvent(event, this.store)
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         } finally {
            this.release()
            await mutexGlobal.release('rxdb::processEvent')
         }
      } else {
         logT(f, 'event ignored', event)
      }
   }

   // для LstCollectionEnum вернет список из objectShort. для WsCollectionEnum - полные сущности
   // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
   // screenSize - список будет обрезаться сверху или снизу чтобы его размер был не больше screenSize
   // autoNextSize - загрузит все что можно
   async find (mangoQuery, autoNextSize = 0, screenSize = 0) {
      assert(this.created, 'cant find! !this.created')
      assert(autoNextSize >= 0, autoNextSize)
      const f = this.find
      const t1 = performance.now()
      logD(f, 'start', mangoQuery)
      mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
      assert(!mangoQuery.pageToken, 'mangoQuery.pageToken')
      try {
         await this.findMutex.lock('rxdb::findInternal') // нужно тк иногда запросы за одной и той же сущностью прилетают друг за другом и начинают выполняться "параллельно" (при этом не срабатывает reactiveDocDbMemCache)
         assert(this.getCurrentUser(), '! this.getCurrentUser !' + JSON.stringify(mangoQuery))
         let populateObjects = mangoQuery.populateObjects
         delete mangoQuery.populateObjects // populateObjects мешает нормальному кэшированию в rxdb (нужно только тут)
         let listId = `mangoQuery:${JSON.stringify(mangoQuery)} populateObjects:${populateObjects} screenSize: ${screenSize} autoNextSize: ${autoNextSize}` // (запросы с и без populate -это разные списки) (то-же и для screenSize)
         let propsCacheItemId = makeId(RxCollectionEnum.LOCAL, 'ReactiveList.props', listId) // до удаления populateObjects
         let propsReactive = await this.get(RxCollectionEnum.LOCAL, propsCacheItemId, {
            fetchFunc: async () => {
               return {
                  item: {}, // пустой объект для начальной иницализации props
                  actualAge: 'infinity'
               }
            }
         })
         assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + listId)
         let findResult
         let cachedReactiveList = this.reactiveDocDbMemCache.get(listId)
         if (cachedReactiveList) findResult = cachedReactiveList
         if (!findResult) {
            logD(f, 'reactive cache miss! goto rxdb...', mangoQuery)
            let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
            assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
            let defaultPageSize = mangoQuery.selector.rxCollectionEnum === RxCollectionEnum.LST_FEED ? 25 : 1000 * 1000
            if (rxCollectionEnum in WsCollectionEnum) {
               // mangoQuery.selector = { rxCollectionEnum: WsCollectionEnum.WS_ANY }
               let rxQuery = await this.workspace.find(mangoQuery)
               findResult = await (new ReactiveListWithPaginationFactory()).create(rxQuery, listId, null, null, propsReactive, screenSize)
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
                        assert(topObject.oid)
                        return this.get(RxCollectionEnum.OBJ, topObject.oid, { clientFirst: true })
                           .then(populatedObject => {
                              let topObjectCopy = cloneDeep(topObject) // не меняем исходную ленту(она реактивна)
                              topObjectCopy.populatedObject = populatedObject
                              return topObjectCopy
                           }).catch(err => {
                              logE('cant populate topObject1:' + topObject.oid, err)
                           })
                     })
                     populatedItems = (await Promise.all(promises)).filter(el => !!el)
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
                  pageSize = defaultPageSize || defaultPageSize
                  let paginationMangoQuery = cloneDeep(mangoQuery)
                  paginationMangoQuery.pagination = { pageSize, pageToken: pageToken || null }
                  let rxDocPagination = await this.lists.find(paginationMangoQuery)
                  return rxDocPagination
               }
               if (propsReactive[listId] && propsReactive[listId].currentPageToken && propsReactive[listId].currentPageSize) {
                  mangoQuery.pagination = { // c запомненной позиции
                     pageSize: propsReactive[listId].currentPageSize,
                     pageToken: propsReactive[listId].currentPageToken
                  }
               } else { // сначала
                  mangoQuery.pagination = {
                     pageSize: defaultPageSize,
                     pageToken: null
                  }
               }
               let rxDocInitial = await this.lists.find(mangoQuery) // начальный запрос (от него пойдет пагинация)
               findResult = await (new ReactiveListWithPaginationFactory()).create(rxDocInitial, listId, populateObjects ? populateFunc : null, paginateFunc, propsReactive, screenSize)
            } else {
               throw new Error('bad collection: ' + rxCollectionEnum)
            }
            assert(findResult, '!findResult' + JSON.stringify(findResult))
            this.reactiveDocDbMemCache.set(listId, findResult)
         }
         await findResult.goto(0, autoNextSize)

         if (findResult.items.length === 0) await findResult.next_(autoNextSize)
         this.store.commit('debug/addFindResult', { listId, findResult })
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
      beforeCreate = false,
      queryId = Date.now(),
      cancel = false
   } = {}) {
      assert(beforeCreate || this.created, 'cant getRxDoc! !this.created')
      const f = this.getRxDoc
      const t1 = performance.now()
      logD(f, 'start')
      let rxCollectionEnum = getRxCollectionEnumFromId(id)
      let rawId = getRawIdFromId(id)
      let rxDoc
      if (rxCollectionEnum in WsCollectionEnum) {
         rxDoc = await this.workspace.get(id)
      } else if (rxCollectionEnum in LstCollectionEnum) {
         rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         rxDoc = await this.objects.get(id, notEvict, priority, clientFirst, force, onFetchFunc, queryId, cancel)
      } else if (rxCollectionEnum === RxCollectionEnum.GQL_QUERY) {
         rxDoc = await this.gqlQueries.get(id, priority, clientFirst, force, onFetchFunc, params)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         rxDoc = await rxdbOperationProxyExec(this.db.meta, 'findOne', id)
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
   // params - доп.параметры для RxCollectionEnum.GQL_QUERY
   // dummyObject - не создавать новый реактивный объект c нуля, а использовать эту болванку (тк эта болванка уже отдана в UI)
   async get (rxCollectionEnum, idOrRawId, {
      id = null,
      fetchFunc,
      notEvict = false,
      clientFirst = true,
      priority = 0,
      force = false,
      onFetchFunc = null,
      params = null,
      beforeCreate = false,
      queryId = Date.now(), // id запроса чтобы потом можно было отменить
      cancel = false // отменить запрос на сервер если это возможно (используется при прокрутке ленты)
   } = {}) {
      const f = this.get
      const t1 = performance.now()
      logD(f, 'start', rxCollectionEnum, idOrRawId, queryId)
      assert(beforeCreate || this.created, 'cant get! !this.created')
      assert(!this.clearInProgress)
      if (!id) {
         assert(idOrRawId, 'idOrRawId!' + JSON.stringify({ rxCollectionEnum, idOrRawId, id }))
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
      if (!reactiveDoc || cancel) {
         let rxDoc = await this.getRxDoc(id, {
            fetchFunc,
            notEvict,
            clientFirst,
            priority,
            force,
            onFetchFunc,
            params,
            beforeCreate,
            queryId,
            cancel
         })
         if (!rxDoc) return null
         reactiveDoc = getReactive(rxDoc)
         this.reactiveDocDbMemCache.set(id, reactiveDoc)
      }
      this.store.commit('debug/addReactiveItem', { id, reactiveItem: reactiveDoc.getPayload() })
      // logW(f, 'end', rxCollectionEnum, idOrRawId, cloneDeep(reactiveDoc))
      let reactiveObject = reactiveDoc.getPayload()
      // -- это уже не надо. Объект с бэкенда приходит заполненный
      // const populate = async (obj, queryId) => {
      //    if (obj.type.in('NODE', 'JOINT')) {
      //       logD('populate itemFull', obj.name, obj.oid)
      //       assert(obj.itemsShort)
      //       let promises = (obj.itemsShort).map(objShort => {
      //          return this.get(RxCollectionEnum.OBJ, objShort.oid, {queryId, clientFirst: true })
      //       })
      //       obj.items = await Promise.all(promises)
      //       // logD('obj.items=', obj.items)
      //    }
      // }
      // if (rxCollectionEnum === RxCollectionEnum.OBJ && !cancel) await populate(reactiveObject, queryId)
      return reactiveObject
   }

   // actualAge - актуально только для кэша
   async set (rxCollectionEnum, data, { actualAge, notEvict = false, beforeCreate = false } = {}) {
      // notice! блокировать нельзя тк возможен дедлок! вызывается ws.set, а он ждет synchro, а она ждет rxdb.set
      const f = this.set
      logD(f, 'start', rxCollectionEnum, data, { actualAge, notEvict })
      const t1 = performance.now()
      assert(beforeCreate || this.created, 'cant set! !this.created')
      assert(!this.clearInProgress)
      assert(data, '!data')
      // assert(!data.wsItemType, '!!data.wsItemType') // передается отдельно от item
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      let rxDoc
      if (rxCollectionEnum in WsCollectionEnum) {
         data.wsItemType = data.wsItemType || rxCollectionEnum
         assert(data.wsItemType === rxCollectionEnum, '!data.wsItemType === rxCollectionEnum')
         rxDoc = await this.workspace.set(data)
         await this.workspace.updateWsSpheres(rxDoc) // создать все сферы и добавить на них rxDoc
         await this.workspace.updateContentOids(rxDoc) // добавить на элемент contentOids(для позиционирования черновиков на контете)
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         let id = makeId(rxCollectionEnum, data.oid)
         rxDoc = await this.cache.set(id, data, actualAge, notEvict)
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         assert(data.id && data.value !== undefined, 'bad data:' + JSON.stringify(data))
         rxDoc = await rxdbOperationProxyExec(this.db.meta, 'atomicUpsert', {
            id: makeId(rxCollectionEnum, data.id),
            meta_data: { value: cloneDeep(data.value) }
         })
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      if (!rxDoc) return null
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return getReactive(rxDoc).getPayload()
   }

   async remove (id, permanent = false) {
      const f = this.remove
      const t1 = performance.now()
      try {
         await this.removeMutex.lock('rxdb::remove')
         logD(f, 'start')
         assert(this.created, 'cant remove! !this.created')
         assert(!this.clearInProgress)
         let collection = getRxCollectionEnumFromId(id)
         if (collection in WsCollectionEnum) {
            await this.workspace.remove(id, permanent)
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
      assert(!this.clearInProgress)
      await this.lists.hideObjectOrSource(oid, authorOid)
   }

   // обновить порядок категорий (последние - вверху)
   async updateCategoryOrder (categoryType) {
      assert(!this.clearInProgress)
      assert(categoryType)
      let order = await this.get(RxCollectionEnum.META, 'categoryOrder')
      assert(order)
      let index = order.indexOf(categoryType)
      if (index !== -1) order.splice(index, 1)
      order.unshift(categoryType)
      await this.set(RxCollectionEnum.META, { id: 'categoryOrder', value: order })
      this.currentState.categoryOrder = order
      // logT('categoryOrder=', order)
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
   RxCollectionEnum,
   getReactive,
   getRxCollectionEnumFromId,
   getRawIdFromId,
   makeId
}
