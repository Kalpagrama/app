import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { LstCollectionEnum, RxCollectionEnum, WsCollectionEnum } from 'src/system/rxdb/common'
import { getRawIdFromId, getRxCollectionEnumFromId, makeId } from 'src/system/rxdb'
import { GqlQueries } from 'src/system/rxdb/gql_query'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB)

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
      assert(!this.created, 'this.created')
      this.created = true
   }

   // получит юзера, запустит обработку эвентов и синхронмзацию мастерской) dummyUser - для входа без регистрации
   async init () {
      assert(this.created, '!created')
      assert(!this.initialized, 'this.initialized уже!')
      const f = this.init
      const t1 = performance.now()
      logD(f, 'start')
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
         throw new Error('not impl!!!')
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
