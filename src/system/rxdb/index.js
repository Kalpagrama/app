import { assert } from 'src/system/common/utils'
import { Workspace } from 'src/system/rxdb/workspace'
import { LstCollectionEnum, RxCollectionEnum, rxdbOperationProxyExec, WsCollectionEnum } from 'src/system/rxdb/common'
import { Cache } from 'src/system/rxdb/cache'
import { Objects } from 'src/system/rxdb/objects'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { addRxPlugin, createRxDatabase, removeRxDatabase } from 'rxdb'
import { getRxStorageLoki } from 'rxdb/plugins/lokijs'
import { Event } from 'src/system/rxdb/event'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
// import { RxDBValidatePlugin } from 'rxdb/plugins/validate'
import { RxDBAjvValidatePlugin } from 'rxdb/plugins/ajv-validate'
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump'
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration'
import { Lists, makeListCacheId } from 'src/system/rxdb/lists'
import { getReactive, ReactiveListWithPaginationFactory } from 'src/system/rxdb/reactive'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import { cacheSchema, schemaKeyValue } from 'src/system/rxdb/schemas'
import cloneDeep from 'lodash/cloneDeep'
import LruCache from 'lru-cache'
import { GqlQueries } from 'src/system/rxdb/gql_query'
import { setSyncEventStorageValue } from 'src/system/services'
import { ObjectApi } from 'src/api/object'
import { store } from 'src/store'
import { wait } from 'src/system/common/common_func'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB)

// in the browser, we want to persist data in IndexedDB, so we use the indexeddb adapter.
const LokiIncrementalIndexedDBAdapter = require('lokijs/src/incremental-indexeddb-adapter');

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

// кээширование объектов перед rxDb (rxDb  очень медленная) (PS уже неактуально (используется LokiJS)) - можно перейти на rxdb
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

      addRxPlugin(RxDBQueryBuilderPlugin)
      addRxPlugin(RxDBAjvValidatePlugin)
      addRxPlugin(RxDBJsonDumpPlugin)
      addRxPlugin(RxDBMigrationPlugin)
      // if (process.env.NODE_ENV === 'development') addRxPlugin(RxDBDevModePlugin)
      this.workspace = new Workspace()
      this.cache = new Cache()
      this.objects = new Objects()
      this.lists = new Lists()
      this.event = new Event()
      this.gqlQueries = new GqlQueries()
      this.processStoreEvent = async (eventKey) => {
         // одна из вкладок пересоздала rxdb либо выполнила rxdb.setAuthUser. Надо обновить
         if (this.created) {
            const f = this.processStoreEvent
            f.nameExtra = 'processStoreEvent'
            logD(f, 'start', eventKey)
            const t1 = performance.now()
            try {
               switch (eventKey) {
                  case 'k_rxdb_recreate_date':
                     await this.recreate(this.store)
                     break
                  case 'k_rxdb_set_auth_user':
                     await this.setCurrentUser_internal()
                     break
                  default:
                     throw new Error('bad event' + eventKey)
               }
            } catch (err) {
               logE('cant process rxdb event! before reload!', err)
               await window.location.reload()
               logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
            }
         }
      }
   }

   onRxDocDelete (id) {
      assert(id)
      assert(this.store)
      this.reactiveDocDbMemCache.del(id)
   }

   // clearStorage - реально стереть данные в indexedDb
   async destroy (clearStorage) {
      if (this.created && this.db) { // пересоздание
         try {
            await mutexGlobal.lock('rxdb::destroy')
            await this.lock('destroy')
            await this.workspace.switchOffSynchro()
            await this.gqlQueries.destroy()
            await this.event.destroy()
            await this.lists.destroy()
            await this.objects.destroy()
            await this.cache.destroy()
            await this.workspace.destroy()
            this.reactiveDocDbMemCache.reset()
            if (this.db.meta) await rxdbOperationProxyExec(this.db.meta, 'destroy')
            if (clearStorage) await this.db.remove()
            else await this.db.destroy()
            this.db = null
            this.created = false
            store.commit('stateSet', ['rxdbInitialized', false])
         } finally {
            this.release()
            await mutexGlobal.release('rxdb::destroy')
         }
      }
   }

   async create (store) {
      const f = this.create
      logT(f, 'start')
      assert(!this.db)
      const t1 = performance.now()
      this.store = store
      try {
         await mutexGlobal.lock('rxdb::create')
         await this.lock('create')
         this.rxStorage = getRxStorageLoki({
            adapter: new LokiIncrementalIndexedDBAdapter()
            // * Do not set lokiJS persistence options like autoload and autosave,
            // * RxDB will pick proper defaults based on the given adapter
         })
         this.db = await createRxDatabase({
            name: 'kalpadb',
            storage: this.rxStorage,
            multiInstance: true // <- multiInstance (optional, default: true)
            // eventReduce: false // если поставить true - будут теряться события об обновлении (по всей видимости - это баг)<- eventReduce (optional, default: true)
            // pouchSettings: { revs_limit: 1 }
         })
         await this.db.addCollections({ meta: { schema: schemaKeyValue } })

         this.reactiveDocDbMemCache.reset()
         await this.workspace.create(this.db, store)
         await this.cache.create(this.db)
         await this.objects.create(this.cache)
         await this.lists.create(this.cache)
         await this.event.create(this.workspace, this.objects, this.lists, this.cache)
         await this.gqlQueries.create(this.cache)
         if (!(await this.get(RxCollectionEnum.META, 'rxdbCreateDate', { beforeCreate: true }))) { // эта вкладка первой инициализироваля rxdb
            await this.set(RxCollectionEnum.META, {
               id: 'rxdbCreateDate',
               valueString: Date.now().toString()
            }, { beforeCreate: true })
         }
         this.created = true // до setCurrentUser_internal
         await this.setCurrentUser_internal()
         logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } catch (err) {
         logE(f, 'rxdb::create error! очищаем и пересоздаем!', err)
         if (this.db) await this.db.remove() // предпочтительно, тк removeRxDatabase иногда глючит
         else if (this.rxStorage) await removeRxDatabase('kalpadb', this.rxStorage)
         throw err
      } finally {
         this.release()
         await mutexGlobal.release('rxdb::create')
      }
   }

   async recreate (store, clearStorage = false) {
      const f = this.recreate
      logT(f, 'start')
      const t1 = performance.now()
      this.store = store
      await this.destroy(clearStorage)
      await this.create(store)
      if (clearStorage) setSyncEventStorageValue('k_rxdb_recreate_date', Date.now().toString()) // сообщаем другим вкладкам
   }

   // получить юзера, запустить обработку эвентов и синхронмзацию мастерской (dummyUser - для входа без регистрации)
   async setCurrentUser_internal () {
      const f = this.setCurrentUser_internal
      logD(f, 'start')
      const t1 = performance.now()
      let authUser = await this.getAuthUser()
      if (authUser) {
         let { userOid, dummyUser } = authUser
         assert(userOid || dummyUser, '!userOid || dummyUser')
         // юзера запрашиваем каждый раз (для проверки актуальной версии мастерской). Если будет недоступно - возьмется из кэша
         let currentUserDb, currentUserDummy, currentUserDbFetched
         if (userOid) {
            currentUserDb = await this.get(RxCollectionEnum.OBJ, userOid, {
               notEvict: true,
               force: true, // данные будут запрошены всегда (даже если еще не истек их срок хранения)
               clientFirst: true, // если в кэше есть данные - то они вернутся моментально (и обновятся в фоне)
               onFetchFunc: async (oldVal, newVal) => { // будет вызвана при получении данных от сервера
                  if (currentUserDb && this.getCurrentUser) this.workspace.switchOnSynchro(this.getCurrentUser()) // в кэше есть данные (onFetchFunc сработает после this.getCurrentUser = ...)
                  else currentUserDbFetched = true // если данных в кэше не было, то onFetchFunc выпольнится раньше, чем this.getCurrentUser = ...
               },
               mirroredVuexObjectKey: 'currentUser' // vuexKey - создаст или обновит связанный объект в vuex по этому ключу
            })
         } else {
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
            currentUserDummy = getReactive(dummyUser, 'currentUser')
         }
         assert(currentUserDb || currentUserDummy, 'currentUserDb || currentUserDummy') // должен быть в rxdb после init
         this.getCurrentUser = () => {
            assert(this.store && this.store.state.mirrorObjects['currentUser'], '!this.store && this.store.state.mirrorObjects[currentUser]')
            return this.store.state.mirrorObjects['currentUser']
         }
         if (currentUserDbFetched) this.workspace.switchOnSynchro(this.getCurrentUser()) // onFetchFunc сработало до этого момента(в кэше не было данных(см clientFirst))
         let settingsDb = await this.get(RxCollectionEnum.GQL_QUERY, 'settings', {
            mirroredVuexObjectKey: 'currentSettings' // создаст или обновит связанный объект в vuex по этому ключу
         })
         assert(settingsDb, '!settingsDb')
         store.commit('stateSet', ['rxdbInitialized', true])
         this.hasCurrentUser = true
      }
      logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async getAuthUser () {
      assert(this.created, '!created')
      let authUser = JSON.parse(await this.get(RxCollectionEnum.META, 'authUser') || 'null') // данные запоминаются после первого успешного init на одной из вкладок
      return authUser
   }

   // запускается единожды после регистрации (НЕ запускается при простой перезагрузке страницы)
   async setAuthUser ({ userOid, dummyUser }) {
      const f = this.setAuthUser
      logD(f, 'start')
      const t1 = performance.now()
      assert(this.created, '!created') // нужна коллекция META
      assert(!(await this.getAuthUser()), '!!this.getAuthUser()')
      assert(userOid || dummyUser, '!userOid || dummyUser')
      try {
         await mutexGlobal.lock('rxdb::setAuthUser')
         await this.lock('setAuthUser')
         await this.set(RxCollectionEnum.META, { id: 'authUser', valueString: JSON.stringify({ userOid, dummyUser }) })
         await this.setCurrentUser_internal()
         setSyncEventStorageValue('k_rxdb_set_auth_user', Date.now().toString()) // сообщаем другим вкладкам
         logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         await mutexGlobal.release('rxdb::setAuthUser')
         this.release()
      }
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
            await this.lock('rxdb::processEvent')// (чтобы дождалась пока отработает rxdb.create, synchronize ws и др)
            assert(this.hasCurrentUser, '! this.hasCurrentUser !')
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
         assert(this.hasCurrentUser, '! this.hasCurrentUser !' + JSON.stringify(mangoQuery))
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
         rxDoc = await this.gqlQueries.get(id, clientFirst, force, onFetchFunc, params)
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
      mirroredVuexObjectKey = null, // создаст или обновит связанный объект в vuex по этому ключу
      queryId = Date.now(), // id запроса чтобы потом можно было отменить
      cancel = false // отменить запрос на сервер если это возможно (используется при прокрутке ленты)
   } = {}) {
      assert(beforeCreate || this.created, 'cant get! !this.created')
      const f = this.get
      const t1 = performance.now()
      logD(f, 'start', rxCollectionEnum, idOrRawId, queryId)
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
      if (!reactiveDoc || mirroredVuexObjectKey || cancel) {
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
         reactiveDoc = getReactive(rxDoc, mirroredVuexObjectKey)
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
      assert(beforeCreate || this.created, 'cant set! !this.created')
      const f = this.set
      logD(f, 'start', rxCollectionEnum, data, { actualAge, notEvict })
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
         rxDoc = await rxdbOperationProxyExec(this.db.meta, 'atomicUpsert', {
            id: makeId(rxCollectionEnum, data.id),
            valueString: data.valueString
         })
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      if (!rxDoc) return null
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return getReactive(rxDoc).getPayload()
   }

   async remove (id) {
      assert(this.created, 'cant remove! !this.created')
      // alert('delete!!!!!!' + id)
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
   RxCollectionEnum,
   getReactive,
   getRxCollectionEnumFromId,
   getRawIdFromId,
   makeId
}
