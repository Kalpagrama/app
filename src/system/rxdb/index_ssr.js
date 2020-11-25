import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
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
      logD(f, 'start')
      const t1 = performance.now()
      assert(!this.created, 'this.created')
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
