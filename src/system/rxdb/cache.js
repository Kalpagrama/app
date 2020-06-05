import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'
import LruCache from 'lru-cache'
import assert from 'assert'
import { cacheSchema } from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Mutex } from 'src/system/rxdb/reactive'
import debounce from 'lodash/debounce'
import { getRxCollectionEnumFromId, RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import { WsCollectionEnum } from 'src/system/rxdb/workspace'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_CACHE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_CACHE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_CACHE)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_CACHE)

// const CachedTypeEnum = Object.freeze({ OBJ: 'OBJ', LST: 'LST', OTHER: 'OTHER', ERROR: 'ERROR' })

const debounceIntervalDumpLru = 1000 * 8 // сохраняем весь LRU в idb с дебаунсом 8 сек
const defaultActualAge = 1000 * 60 * 60 // время жизни объекта в кэше (по умолчанию)
const defaultCacheSize = 1 * 1024 * 1024 // 1Mb // todo увеличить до 50 МБ после тестирования
if (defaultCacheSize < 20 * 1024 * 1024) logW('TODO увеличить кэш до 50 МБ после тестирования')

const DEBUG_IGNORE_CACHE = false // если === true - брать из сети (игнорить кэш)

// класс для кэширования gql запросов
class Cache {
  constructor (db) {
    assert(db, '!rxdb')
    this.db = db
  }

  async createCollections () {
    let f = this.createCollections
    await this.db.collection({ name: 'cache', schema: cacheSchema })
  }

  // удалить все данные из кэша
  async clearCollections () {
    const f = this.clearCollections
    logD(f, 'start')
    try {
      this.lruResetInProgress = true
      this.cacheLru.reset()
    } finally {
      this.lruResetInProgress = true
    }
    if (this.db.cache) {
      await this.db.cache.remove()
    }
    await this.createCollections()
    logD(f, 'complete')
  }

  async create (recursive = false) {
    const f = this.create
    logD(f, 'start')
    assert(!this.created, 'this.created')
    try {
      this.mutex = new Mutex()
      await this.createCollections()
      // используется для контроля места
      this.cacheLru = new LruCache({
        max: defaultCacheSize,
        length: function (n, id) {
          return JSON.stringify(n).length + id.length
        },
        maxAge: 0, // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
        noDisposeOnSet: true,
        dispose: async (id, { actualUntil, actualAge }) => {
          const f = this.dispose
          if (this.lruResetInProgress) return
          assert(actualUntil && actualAge >= 0, `actualUntil && actualAge >= 0 ${actualUntil} ${actualAge}`)
          let rxDoc = await this.db.cache.findOne(id).exec()
          if (rxDoc) {
            if (rxDoc.props.notEvict) { // кладем обратно в LRU! (некоторые данные должны жить вечно!)
              setTimeout(() => {
                this.cacheLru.set(id, { actualUntil, actualAge })
              }, 0)
            } else { // удалим из rxdb (освобождаем от старых данных)
              logD(f, 'элемент вытеснен из кэша', id)
              await rxDoc.remove()
            }
          }
        }
      })

      // заполняем cacheLru из idb
      let lruDump = await rxdb.get(RxCollectionEnum.META, 'lruDump')
      if (lruDump) {
        logD(f, 'восстанавливаем Lru')
        lruDump = JSON.parse(lruDump)
        this.cacheLru.load(lruDump)
      }

      this.debouncedDumpLru = debounce(async () => {
        const f = this.debouncedDumpLru
        logD(f, 'start. debouncedDumpLru')
        let lruDump = this.cacheLru.dump()
        await rxdb.set(RxCollectionEnum.META, { id: 'lruDump', valueString: JSON.stringify(lruDump) })
      }, debounceIntervalDumpLru)

      // из-за debounce сохранения - на старте может оказаться, что в rxdb запись есть, а в lru - нет!
      for (let rxDoc of await this.db.cache.find().exec()) {
        if (!this.cacheLru.get(rxDoc.id)) {
          this.cacheLru.set(rxDoc.id, {
            actualUntil: Date.now() + debounceIntervalDumpLru,
            actualAge: 1000 * 60
          })
        }
      }

      this.created = true
      logD(f, 'complete')
    } catch (err) {
      logE(f, 'ошибка при создания CACHE! очищаем и пересоздаем!', err)
      await this.clearCollections()
      if (!recursive) await this.create(true)
    }
  }

  async lock () {
    await this.mutex.lock()
  }

  release () {
    this.mutex.release()
  }

  async find (mangoQuery) {
    return await this.db.cache.find(mangoQuery).exec()
  }

  // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
  //   cached: {data} data может быть как объектом, так и любым другим типом
  async set (id, data, actualAge, notEvict, withLock = true) {
    try {
      if (withLock) await this.lock()
      assert(this.created, '!this.created')
      assert(id && data, '!id && data' + id + JSON.stringify(data))
      let rxCollectionEnum = getRxCollectionEnumFromId(id)
      let f = this.set
      logD(f, 'start', id)
      actualAge = actualAge || 'stale'
      switch (actualAge) {
        case 'zero':
          actualAge = 0
          break
        case 'minute':
          actualAge = 1000 * 60
          break
        case 'hour':
          actualAge = 1000 * 60 * 60
          break
        case 'day':
          actualAge = 1000 * 60 * 60 * 24
          break
        case 'week':
          actualAge = 1000 * 60 * 60 * 24 * 7
          break
        case 'month':
          actualAge = 1000 * 60 * 60 * 24 * 30
          break
        case 'year':
          actualAge = 1000 * 60 * 60 * 24 * 360
          break
        case 'prolong': {
          let current = this.cacheLru.get(id)
          if (current) {
            actualAge = current.actualAge
          } else {
            actualAge = defaultActualAge
          }
          break
        }
        case 'stale': {
          // оставить как было
          let current = this.cacheLru.get(id)
          if (current) {
            actualAge = Math.max(0, current.actualUntil - Date.now())
          } else {
            actualAge = this.defaultActualAge
          }
          break
        }
        default:
          throw new Error('bad actualAge:' + actualAge)
      }
      if (DEBUG_IGNORE_CACHE) actualAge = 0 // игнорируем кэш
      assert(Number.isInteger(actualAge) && actualAge >= 0, `Number.isInteger(actualAge):${actualAge}`)
      let actualUntil = Date.now() + actualAge
      this.cacheLru.set(id, { actualUntil, actualAge }) // сохраняем в lru
      const rxDoc = await this.db.cache.atomicUpsert({
        id,
        props: {
          notEvict,
          oid: data && data.oid ? data.oid : undefined, // есть только у RxCollectionEnum.OBJ и RxCollectionEnum.LST_...
          rxCollectionEnum
        },
        cached: { data }
      }) // сохраняем в rxdb
      await this.debouncedDumpLru()
      logD(f, 'complete')
      return rxDoc
    } finally {
      if (withLock) this.release()
    }
  }

  // вернет из кэша, в фоне запросит данные через fetchFunc. может вернуть null
  async get (id, fetchFunc, clientFirst = true, force = false) {
    try {
      await this.lock()
      assert(this.created, '!this.created')
      assert(id)
      let f = this.get
      logD(f, 'start', id)
      if (DEBUG_IGNORE_CACHE) logW(f, 'DEBUG_IGNORE_CACHE is ON!!!')
      let rxDoc = await this.db.cache.findOne(id).exec()
      let { actualUntil, actualAge, failReason } = this.cacheLru.get(id) || {}
      // logD(f, 'start2', force, new Date(actualUntil), new Date(Date.now()), Date.now() > actualUntil)
      if (force || !actualUntil || Date.now() > actualUntil) { // данные отсутствуют в кэше, либо устарели
        if (fetchFunc) {
          let processFetchErrorFunc = async (err) => {
            if (err === 'queued item was evicted legally') { // ничего не делаем
              logD(f, 'Данные не получены! запрос на сервер был отброшен(легально) по причне переполнения очереди!', err)
            } else {
              logE('Данные не получены! Произошла ошибка. Через минуту  можно пробовать еще', err)
              const min = 1000 * 60
              this.cacheLru.set(id, {
                actualUntil: Date.now() + min,
                actualAge: min,
                failReason: 'fetch error: ' + err.toString()
              })
            }
          }
          let saveFunc = async (fetchRes) => {
            logD(f, 'данные с сервера получены', fetchRes)
            assert(fetchRes, '!fetchRes')
            assert('item' in fetchRes && 'actualAge' in fetchRes, 'bad fetchRes: ' + JSON.stringify(fetchRes))
            let notEvict = fetchRes.notEvict || false
            let res = await this.set(id, fetchRes.item, fetchRes.actualAge, notEvict, false)
            logD(f, 'записаны в кэш')
            return res
          }
          logD(f, 'запрашиваем данные с сервера...')
          if (rxDoc && clientFirst) { // если данные есть - не ждем ответа сервера (вернуть то что есть) Потом данные реактивно обновятся
            fetchFunc().then(saveFunc).catch(processFetchErrorFunc)
          } else { // ждем ответа сервра
            try {
              rxDoc = await saveFunc(await fetchFunc())
            } catch (err) {
              await processFetchErrorFunc(err)
            }
          }
        }
      }
      if (!rxDoc) {
        logD(f, 'not found', rxDoc, failReason)
        if (failReason) {
          let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
          let tryAfter = Math.max(0, (actualUntil - Date.now()) / 1000)
          throw new Error(`При извлечении из БД произошла ошибка можно попробовать через ${Math.ceil(tryAfter)} сек` + failReason)
        }
        return null
      }
      logD(f, 'complete', rxDoc)
      return rxDoc
    } finally {
      this.release()
    }
  }

  async expire (id) {
    try {
      await this.lock()
      let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
      if (actualUntil) this.cacheLru.set(id, { actualUntil: Date.now(), actualAge: 0 })
    } finally {
      this.release()
    }
  }
}

export { Cache }
