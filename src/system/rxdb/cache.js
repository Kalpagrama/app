import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'
import LruCache from 'lru-cache'
import assert from 'assert'
import { schemaKeyValue, cacheSchema } from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Mutex, ReactiveItemHolder } from 'src/system/rxdb/reactive'
import { WsCollectionEnum } from 'src/system/rxdb/workspace'
import { fragments } from 'src/api'
import { ObjectsApi } from 'src/api/objects'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_CACHE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_CACHE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_CACHE)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_CACHE)

const CacheItemTypeEnum = Object.freeze({ OBJ: 'OBJ', LST: 'LST', OTHER: 'OTHER', ERROR: 'ERROR' })

const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк
// TODO увеличить до 50 МБ после тестирования
const lruDumpPeriod = 1000 * 60 * 8 // периодически(раз в 8 минут) сохраняем LRU в idb
const defaultActualAge = 1000 * 60 * 60 // время жизни объекта в кэше (по умолчанию)
// TODO увеличить до 50 МБ после тестирования
const defaultCacheSize = 1 * 1024 * 1024 // 1Mb // todo увеличить!

// класс для кэширования gql запросов
class Cache {
  getType (cached) {
    assert(cached, '!cached')
    assert('data' in cached, '!data in cached')
    let type = CacheItemTypeEnum.OTHER
    if (cached.data.oid) {
      type = CacheItemTypeEnum.OBJ
    } else if (cached.data.items && Array.isArray(cached.data.items)) {
      type = CacheItemTypeEnum.LST
    } else if (cached.failReason) type = CacheItemTypeEnum.ERROR
    return type
  }

  async createDb () {
    let f = this.createDb
    this.isLeader = false
    this.db = await createRxDatabase({
      name: 'cache',
      adapter: 'idb', // <- storage-adapter
      multiInstance: true, // <- multiInstance (optional, default: true)
      eventReduce: true, // <- eventReduce (optional, default: true)
      pouchSettings: { revs_limit: 1 }
    })
    await this.db.collection({ name: 'cache', schema: cacheSchema })
    await this.db.collection({ name: 'cache_meta', schema: schemaKeyValue })
    this.db.waitForLeadership().then(() => {
      logD(f, 'RXDB::CACHE::LEADER!!!!')
      this.isLeader = true
    })
    // // хуки на измения элементов в кэше пользователем
    // let onCachedObjectChangedByUser = async (id, operation) => {
    //   const f = onCachedObjectChangedByUser
    //   if (!this.isLeader) return
    //   assert(id && operation && operation in CacheOperationEnum, 'bad params' + id + operation)
    //   // todo пока что изменяется только currentUser (настройки, ленты и пр)
    //   // assert(false, 'assert(false, todo! not impl!)')
    //   logD(f, `complete. ${id}`)
    // }
    // this.db.cache_object.postInsert(async (plainData) => {
    //   await onCachedObjectChangedByUser(plainData.id, CacheOperationEnum.UPSERT)
    // }, false)
    // this.db.cache_object.postSave(async (plainData) => {
    //   await onCachedObjectChangedByUser(plainData.id, CacheOperationEnum.UPSERT)
    // }, false)
    // this.db.cache_object.postRemove(async (plainData) => {
    //   await onCachedObjectChangedByUser(plainData.id, CacheOperationEnum.DELETE)
    // }, false)
  }

  // rxdb не удаляет элементы, а помечает удаленными! purgeDb - очистит помеченные удаленными
  async purgeDb () {
    let f = this.purgeDb
    logD(f, 'purgeDb cache_db')
    let purgeLastDateDoc = await this.db.cache_meta.findOne('purgeLastDate').exec()
    let purgeLastDate = purgeLastDateDoc ? parseInt(purgeLastDateDoc.value) : 0
    if (Date.now() - purgeLastDate < purgePeriod) return
    await this.db.cache_meta.atomicUpsert({ id: 'purgeLastDate', value: Date.now().toString() })
    let dump = await this.db.dump()
    await this.db.remove()
    await this.db.destroy()
    await this.createDb()
    await this.db.importDump(dump)
  }

  // удалить все данные из кэша
  async clear () {
    const f = this.clear
    logD(f, 'start')
    await this.db.remove()
    try {
      this.lruResetInProgress = true
      this.cacheLru.reset()
    } finally {
      this.lruResetInProgress = true
    }

    await this.createDb()
    logD(f, 'complete')
  }

  async create (recursive = false) {
    const f = this.create
    logD(f, 'start')
    assert(!this.created, 'this.created')
    try {
      this.mutex = new Mutex()
      await this.createDb()
      await this.purgeDb()
      // используется для контроля места
      this.cacheLru = new LruCache({
        max: defaultCacheSize,
        length: function (n, id) {
          return JSON.stringify(n).length + id.length
        },
        maxAge: 0, // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
        noDisposeOnSet: true,
        dispose: async (id, { actualUntil, actualAge }) => {
          if (this.lruResetInProgress) return
          assert(actualUntil && actualAge >= 0, `actualUntil && actualAge >= 0 ${actualUntil} ${actualAge}`)
          let rxDoc = await this.db.cache.findOne(id).exec()
          if (rxDoc) {
            if (rxDoc.notEvict) { // кладем обратно в LRU! (некоторые данные должны жить вечно!)
              setTimeout(() => {
                this.cacheLru.set(id, { actualUntil, actualAge })
              }, 0)
            } else { // удалим из rxdb (освобождаем от старых данных)
              await rxDoc.remove()
            }
          }
        }
      })

      // заполняем cacheLru из idb
      let lruDump = await this.db.cache_meta.findOne('lruDump').exec()
      if (lruDump) this.cacheLru.load(JSON.parse(lruDump.value))

      setInterval(async () => { // периодически сохраняем lru
        let lruDump = this.cacheLru.dump()
        await this.db.cache_meta.atomicUpsert({ id: 'lruDump', value: JSON.stringify(lruDump) })
      }, lruDumpPeriod)

      // из-за периодического сохранения - на старте может оказаться, что в rxdb запись есть, а в lru - нет!
      for (let rxDoc of await this.db.cache.find().exec()) {
        if (!this.cacheLru.get(rxDoc.id)) {
          this.cacheLru.set(rxDoc.id, {
            actualUntil: Date.now() + lruDumpPeriod,
            actualAge: lruDumpPeriod
          })
        }
      }

      this.created = true
      logD(f, 'complete')
    } catch (err) {
      logE(f, 'ошибка при создания CACHE! очищаем и пересоздаем!', err)
      await this.clear()
      if (!recursive) await this.create(true)
    }
  }

  async lock () {
    await this.mutex.lock()
  }

  release () {
    this.mutex.release()
  }

  // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
  async set (id, type, cached, actualAge, notEvict) {
    assert(this.created, '!this.created')
    assert(id && cached, `id && cached ${id} ${cached}`)
    assert(typeof cached === 'object', 'typeof cached === object')
    assert(type in CacheItemTypeEnum, 'bad type' + type)
    assert(type === this.getType(cached), 'type')
    assert('data' in cached, '!data in cached')
    let f = this.set
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
      }
        break
      default: {
        if (!Number.isInteger(actualAge)) {
          // такой элемент уже есть в кэше оставляем что было
          let current = this.cacheLru.get(id)
          if (current) {
            actualAge = Math.max(0, current.actualUntil - Date.now())
          } else {
            actualAge = defaultActualAge
          }
          assert(actualAge == null || Number.isInteger(actualAge))
          if (actualAge == null) actualAge = defaultActualAge
        }
        break
      }
    }
    assert(Number.isInteger(actualAge) && actualAge >= 0, `Number.isInteger(actualAge):${actualAge}`)
    let actualUntil = Date.now() + actualAge
    this.cacheLru.set(id, { actualUntil, actualAge }) // сохраняем в lru
    const rxDoc = await this.db.cache.atomicUpsert({ id, type, notEvict, cached}) // сохраняем в rxdb
    return rxDoc
  }

  // вернет из кэша, в фоне запросит данные через fetchFunc. может вернуть null
  async get (id, fetchFunc, force) {
    assert(this.created, '!this.created')
    assert(id)
    let f = this.get
    logD(f, 'start')
    let rxDoc = await this.db.cache.findOne(id).exec()
    let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
    if (force || !actualUntil || Date.now() > actualUntil) { // данные отсутствуют в кэше, либо устарели
      if (fetchFunc) {
        let processFetchErrorFunc = async (err) => {
          if (err === 'queued item was evicted legally') { // ничего не делаем
            logD(f, 'Данные не получены! запрос на сервер был отброшен(легально) по причне переполнения очереди!', err)
          } else {
            logE('Данные не получены! Произошла ошибка. Через минуту  можно пробовать еще', err)
            let cached = rxDoc ? rxDoc.cached : { failReason: err, data: null }
            let notEvict = rxDoc ? rxDoc.notEvict : false
            this.set(id, this.getType(cached), cached, 'minute', notEvict)
          }
        }
        let saveFunc = async (fetchRes) => {
          logD(f, 'данные с сервера получены', fetchRes)
          assert(fetchRes, '!fetchRes')
          assert('item' in fetchRes && 'actualAge' in fetchRes && 'type' in fetchRes, 'bad fetchRes: ' + JSON.stringify(fetchRes))
          assert(fetchRes.type in CacheItemTypeEnum, 'bad type: ' + fetchRes.type)
          assert(fetchRes.type === this.getType({data: fetchRes.item}), 'bad fetchRes.type' + fetchRes.type)
          let notEvict = fetchRes.notEvict || false
          let res = await this.set(id, fetchRes.type, {data: fetchRes.item}, fetchRes.actualAge, notEvict)
          logD(f, 'записаны в кэш')
          return res
        }
        logD(f, 'запрашиваем данные с сервера...')
        if (rxDoc && !rxDoc.cached.failReason) { // если данные есть - не ждем ответа сервера (вернуть то что есть) Потом данные реактивно обновятся
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
    if (!rxDoc) { // если задана fetchFunc - см "queued item was evicted legally"
      logD(f, 'not found', rxDoc)
      return null
    }
    if (rxDoc.cached.failReason) {
      let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
      let tryAfter = Math.max(0, (actualUntil - Date.now()) / 1000)
      throw new Error(`При извлечении из БД произошла ошибка можно попробовать через ${Math.ceil(tryAfter)} сек` + rxDoc.cached.failReason)
    }
    logD(f, 'complete')
    return rxDoc
  }
}

export { Cache, CacheItemTypeEnum }
