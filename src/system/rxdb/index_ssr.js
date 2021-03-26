import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { LstCollectionEnum, RxCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { getRawIdFromId, getRxCollectionEnumFromId, makeId, rxdb } from 'src/system/rxdb'
import { GqlQueries } from 'src/system/rxdb/gql_query'
import { AuthApi } from 'src/api/auth'
import cloneDeep from 'lodash/cloneDeep'
import { ReactiveListWithPaginationFactory, GROUP_BATCH_SZ } from 'src/system/rxdb/reactive'
import { ListsApi as ListApi } from 'src/api/lists'
import { ObjectApi } from 'src/api/object'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SSR)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SSR)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SSR)

const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк
const defaultCacheSize = 10 * 1024 * 1024 // кэш реактивных объектов
if (defaultCacheSize < 10 * 1024 * 1024) logW('TODO увеличить rxDbMemCache до 10 МБ после тестирования')

class RxDBDummy {
   constructor () {
      this.created = false
   }

   async create (store) {
      const f = this.create
      logD(f, 'start???')
      const t1 = performance.now()
      // assert(!this.created, 'this.created')
      this.created = true
   }

   // получит юзера, запустит обработку эвентов и синхронмзацию мастерской) dummyUser - для входа без регистрации
   async init () {
      assert(this.created, '!created')
      const f = this.init
      const t1 = performance.now()
      logD(f, 'start')
      const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
      // logD('userIdentify = ', { userExist, userId, needInvite, needConfirm, dummyUser, loginType })
      assert(dummyUser, '!dummyUser')
      this.getCurrentUser = () => {
         return dummyUser
      }
      this.initialized = true
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async processEvent (event) {
      assert(this.created, 'cant processEvent! !this.created')
      const f = this.processEvent
      const t1 = performance.now()
      logD(f, 'start', event)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   // для LstCollectionEnum вернет список из objectShort. для WsCollectionEnum - полные сущности
   // поищет в rxdb (если надо - запросит с сервера) Вернет {items, count, totalCount, nextPageToken }
   async find (mangoQuery, autoNext = true) {
      assert(this.created, 'cant find! !this.created')
      const f = this.find
      const t1 = performance.now()
      logD(f, 'start')
      mangoQuery = cloneDeep(mangoQuery) // mangoQuery модифицируется внутри (JSON.parse не пойдет из-за того, что в mangoQuery есть regexp)
      assert(this.initialized, '! this.initialized0 !')
      const queryId = JSON.stringify(mangoQuery)
      assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 1: ' + queryId)
      let findResult = []
      findResult.nextIndex = 0
      findResult.nextPageIndex = 0
      findResult.next = async (count) => {
         return false
      }
      let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      if (rxCollectionEnum in WsCollectionEnum) {
         // throw new Error('not impl')
      } else if (rxCollectionEnum in LstCollectionEnum) {
         let populateObjects = mangoQuery.populateObjects
         delete mangoQuery.populateObjects // мешает нормальному кэшированию
         let populateFunc = async (itemsForPopulate, itemsForPrefetch) => {
            const f = populateFunc
            f.nameExtra = 'populateFunc'
            logD(f, 'start', itemsForPopulate.length, itemsForPrefetch.length)
            const t1 = performance.now()
            let populatedItems = cloneDeep(itemsForPopulate)
            let oids = itemsForPopulate.map(item => {
               if (rxCollectionEnum === RxCollectionEnum.LST_FEED) return item.object.oid
               else return item.oid
            })
            let objectList = await ObjectApi.objectList(oids)

            if (rxCollectionEnum === RxCollectionEnum.LST_FEED) {
               for (let item of populatedItems) {
                  let fullItem = objectList.find(obj => obj.oid === item.oid)
                  assert(fullItem, '!fullItem')
                  item.object = fullItem
               }
            } else {
               for (let i = 0; i < populatedItems.length; i++) {
                  let fullItem = objectList.find(obj => obj.oid === populatedItems[i].oid)
                  assert(fullItem, '!fullItem')
                  populatedItems[i] = fullItem
               }
            }
            assert(populatedItems && Array.isArray(populatedItems))
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
            return populatedItems.filter(obj => !!obj)
         }

         let { items, totalCount, nextPageToken, currentPageToken, prevPageToken } = await ListApi.getList(mangoQuery)
         let totalItems = items
         findResult.next = async (count) => {
            if (populateObjects) assert(count <= GROUP_BATCH_SZ, `count <= ${GROUP_BATCH_SZ}! value =` + count)
            if (!count && findResult.nextIndex === 0) { // autoNext
               if (populateObjects) count = GROUP_BATCH_SZ // дорогая операция
               else count = totalItems.length // выдаем все элементы разом
            }
            findResult.nextPageIndex = findResult.nextIndex + count
            if (findResult.nextIndex >= totalItems.length) return false // дошли до конца списка
            let fromIndex = findResult.nextIndex
            findResult.nextIndex = findResult.nextIndex + count
            let nextItems = totalItems.slice(fromIndex, findResult.nextIndex)
            let prefetchItems = []
            if (count < GROUP_BATCH_SZ) prefetchItems = totalItems.slice(findResult.nextIndex, findResult.nextIndex + 4) // упреждпющее чтение
            if (populateObjects) nextItems = await populateFunc(nextItems, prefetchItems) // запрашиваем полные сущности
            findResult.splice(findResult.length, 0, ...nextItems)
            return findResult.nextIndex < totalItems.length
         }
      } else {
         throw new Error('bad collection:' + rxCollectionEnum)
      }
      assert(findResult && findResult.next, '!findResult.next')
      if (autoNext) await findResult.next()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return findResult
   }

   // clientFirst - вернуть данные из кэша (даже если они устарели), а потом в фоне реактивно обновить
   // onFetchFunc - коллбэк, который будет вызван, когда данные будут получены с сервера
   // params - допюпараметры для RxCollectionEnum.GQL_QUERY
   async get (rxCollectionEnum, idOrRawId, { id = null, fetchFunc, notEvict = false, clientFirst = true, priority = 0, force = false, onFetchFunc = null, params = null, beforeCreate = false } = {}) {
      assert(beforeCreate || this.created, 'cant get! !this.created')
      const f = this.get
      const t1 = performance.now()
      logW(f, 'start', rxCollectionEnum, idOrRawId)
      if (!id) {
         assert(idOrRawId)
         if (idOrRawId.includes('::')) {
            id = idOrRawId
         } else {
            assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
            id = makeId(rxCollectionEnum, idOrRawId, params)
         }
      }
      assert(id, 'bad id: ' + id)
      rxCollectionEnum = getRxCollectionEnumFromId(id) // иногда вызывается без rxCollectionEnum (когда известен только id)
      let result
      let rawId = getRawIdFromId(id)
      if (rxCollectionEnum in WsCollectionEnum) {
         throw new Error('not impl!!!')
      } else if (rxCollectionEnum in LstCollectionEnum) {
         throw new Error('not impl!!!')
      } else if (rxCollectionEnum === RxCollectionEnum.OBJ) {
         let oid = getRawIdFromId(id)
         result = await ObjectApi.objectFull(oid)
      } else if (rxCollectionEnum === RxCollectionEnum.GQL_QUERY) {
         let fetchFunc = GqlQueries.getFetchFunc(id, params)
         let { item } = await fetchFunc()
         result = item
      } else if (rxCollectionEnum === RxCollectionEnum.META) {
         throw new Error('not impl!!!')
      } else {
         throw new Error('bad collection' + rxCollectionEnum)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return result
   }

   // actualAge - актуально только для кэша
   async set (rxCollectionEnum, data, { actualAge, notEvict = false, beforeCreate = false } = {}) {
      // notice! блокировать нельзя тк возможен дедлок! вызывается ws.set, а он ждет synchro, а она ждет rxdb.set
      assert(beforeCreate || this.created, 'cant set! !this.created')
      const f = this.set
      logD(f, 'start', rxCollectionEnum, data, { actualAge, notEvict })
      const t1 = performance.now()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async remove (id) {
      assert(this.created, 'cant remove! !this.created')
      const f = this.remove
      const t1 = performance.now()
      logD(f, 'start')
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }
}

const rxdbDummy = new RxDBDummy()

export {
   rxdbDummy
}
