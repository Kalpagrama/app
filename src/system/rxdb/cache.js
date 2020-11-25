import LruCache from 'lru-cache'
import assert from 'assert'
import { cacheSchema, schemaKeyValue } from 'src/system/rxdb/schemas'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import debounce from 'lodash/debounce'
import { getRxCollectionEnumFromId, rxdb } from 'src/system/rxdb/index_browser'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { wait } from 'src/system/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_CACHE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_CACHE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_CACHE)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_CACHE)

const debounceIntervalDumpLru = 1000 * 8 // сохраняем весь LRU в idb с дебаунсом 8 сек
const defaultActualAge = 1000 * 60 * 60 // время жизни объекта в кэше (по умолчанию час)
const defaultCacheSize = 50 * 1024 * 1024 // кэш в rxdb
if (defaultCacheSize < 50 * 1024 * 1024) logW('TODO увеличить кэш до 50 МБ после тестирования')

const DEBUG_IGNORE_CACHE = false // если === true - брать из сети (игнорить кэш)

// класс для кэширования gql запросов
class Cache {
   constructor (db) {
      assert(db, '!rxdb')
      this.db = db
   }

   async updateCollections (operation) {
      assert(operation.in('create', 'delete', 'recreate'))
      const f = this.updateCollections
      logD(f, 'start')
      const t1 = performance.now()
      if (operation.in('delete', 'recreate')) {
         if (this.db.cache) await this.db.cache.remove()
         try {
            this.lruResetInProgress = true
            if (this.cacheLru) this.cacheLru.reset()
         } finally {
            this.lruResetInProgress = true
         }
      }
      if (operation.in('create', 'delete', 'recreate')) {
         if (this.db.cache) await this.db.cache.destroy()
      }
      if (operation.in('create', 'recreate')) {
         await this.db.collection({ name: 'cache', schema: cacheSchema })
         assert(this.db.cache, '!this.db.cache')
         this.db.cache.postInsert(async (plainData) => {
            await this.debouncedDumpLru()
         }, false)
         this.db.cache.postSave(async (plainData) => {
            await this.debouncedDumpLru()
         }, false)
         this.db.cache.postRemove(async (plainData) => {
            await this.debouncedDumpLru()
            rxdb.onRxDocDelete(plainData.id)
         }, false)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async create () {
      const f = this.create
      logD(f, 'start')
      const t1 = performance.now()
      assert(!this.created, 'this.created')
      try {
         this.mutex = new MutexLocal('rxdb::cache')
         // используется для контроля места (при переполнении - объект удалится из rxdb)
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
         // let lruDump = await rxdb.get(RxCollectionEnum.META, 'lruDump') // так не делаем чтобы reactiveItem не дергался каждый раз при измнении
         let lruDumpDoc = await rxdb.db.meta.findOne('lruDump').exec()
         if (lruDumpDoc) {
            logD(f, 'восстанавливаем Lru')
            let lruDump = JSON.parse(lruDumpDoc.valueString)
            this.cacheLru.load(lruDump)
         }
         this.debouncedDumpLru = debounce(async () => {
            const f = this.debouncedDumpLru
            f.nameExtra = 'debouncedDumpLru'
            if (!mutexGlobal.isLeader()) return // вкладок много (все не могут хранить свои состояния) Храним состояние лидера
            logD(f, 'start', 'debouncedDumpLru')
            const t1 = performance.now()
            let lruDump = this.cacheLru.dump()
            await this.db.meta.atomicUpsert({ id: 'lruDump', valueString: JSON.stringify(lruDump) })
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         }, debounceIntervalDumpLru, { maxWait: 60 * 1000 })

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
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, this.created)
      } finally {
      }
   }

   async lock (lockOwner) {
      await this.mutex.lock(lockOwner)
   }

   release () {
      this.mutex.release()
   }

   async find (mangoQuery) {
      return await this.db.cache.find(mangoQuery).exec()
   }

   // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
   //   cached: {data} data может быть как объектом, так и любым другим типом
   async set (id, data, actualAge, notEvict, mangoQuery = {}) {
      assert(this.created, '!this.created')
      assert(id && data, '!id && data' + id + JSON.stringify(data))
      let rxCollectionEnum = getRxCollectionEnumFromId(id)
      const f = this.set
      logD(f, 'start', id)
      const t1 = performance.now()
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
         case 'century':
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
      let plainDoc = {
         id,
         props: {
            notEvict,
            oid: data && data.oid ? data.oid : undefined, // есть только у RxCollectionEnum.OBJ и RxCollectionEnum.LST_...
            rxCollectionEnum,
            mangoQuery
         },
         cached: { data }
      }
      // const rxDoc = await this.db.cache.atomicUpsert(plainDoc) // // если вставлять через atomicUpsert, то на большом числе документов случаются тормоза (один апсерт длится до 5 секунд и они сериализуются)
      const rxDoc = await this.upsertRxDocDebounce(plainDoc) // сохраняем в rxdb
      this.cacheLru.set(id, { actualUntil, actualAge }) // сохраняем в lru
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
   }

   // если вставлять через atomicUpsert, то на большом числе документов случаются тормоза (один апсерт длится до 5 секунд и они сериализуются)
   async upsertRxDocDebounce (plainDoc) {
      if (!this.debouncedBatchUpdate) {
         this.debouncedBatchUpdate = debounce(async () => {
            const f = this.debouncedBatchUpdate
            f.nameExtra = 'debouncedBatchUpdate'
            const t1 = performance.now()
            try {
               await this.lock('rxdb::cache::set')
               let debouncedUpdateQueueCopy = this.debouncedUpdateQueue
               this.debouncedUpdateQueue = [] // пока debouncedBatchUpdate выполняется, - очередь может пополняться
               try {
                  let uniquePlainDocs = {}
                  for (let { plainDoc } of debouncedUpdateQueueCopy) uniquePlainDocs[plainDoc.id] = plainDoc
                  // logW(f, `try update batch queue sz = ${debouncedUpdateQueueCopy.length} unique = ${Object.keys(uniquePlainDocs).length}`)
                  // если такие уже есть - удалим
                  await this.db.cache.find({ selector: { id: { $in: Object.keys(uniquePlainDocs) } } }).remove()
                  // logD('before insert', Object.values(uniquePlainDocs), await this.db.cache.find({ selector: { id: { $in: Object.keys(uniquePlainDocs) } } }).exec())
                  let { success, error } = await this.db.cache.bulkInsert(Object.values(uniquePlainDocs))
                  // let inserted = await this.db.cache.find({ selector: { id: { $in: Object.keys(uniquePlainDocs) } } }).exec()
                  // for (let doc of inserted)logW('after insert', doc.toJSON())
                  for (let { plainDoc, resolve, reject } of debouncedUpdateQueueCopy) {
                     let rxDocUpdated = success.find(rxDoc => rxDoc.id === plainDoc.id)
                     if (rxDocUpdated) resolve(rxDocUpdated)
                     else {
                        reject('bulkInsert error! uniquePlainDocs=' + JSON.stringify({uniquePlainDocs, success, error}))
                     }
                  }
               } catch (err) {
                  logE('cant debouncedUpdateQueue', err)
                  for (let { reject } of this.debouncedUpdateQueue)reject(err)
               }
            } finally {
               this.release()
               logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
            }
         }, 300, { leading: true, maxWait: 8888 })
         this.debouncedUpdateQueue = []
      }
      // запросы на обновление накапливаются и выполняются пачкой (иначе у rxdb - проблемы)
      return new Promise((resolve, reject) => {
         assert(plainDoc && plainDoc.id, 'plainDoc && plainDoc.id')
         this.debouncedUpdateQueue.push({ plainDoc, resolve, reject })// сохраняем КАЖДЫЙ запрос (даже если id повторяются)
         this.debouncedBatchUpdate()
      })
   }

   isActual (id, cachedInfo = null) {
      cachedInfo = cachedInfo || this.cacheLru.get(id) // {actualUntil, actualAge, failReason}
      return cachedInfo && Date.now() <= cachedInfo.actualUntil
   }

   // вернет из кэша, в фоне запросит данные через fetchFunc. может вернуть null
   async get (id, fetchFunc = null, clientFirst = true, force = false, onFetchFunc = null) {
      try {
         // await this.lock('rxdb::get') ! нельзя тк необходимо чтобы запросы выполнялись параллельно (см QueryAccumulator)
         assert(this.created, '!this.created')
         assert(id)
         const f = this.get
         logD(f, 'start', id)
         const t1 = performance.now()
         if (DEBUG_IGNORE_CACHE) logW(f, 'DEBUG_IGNORE_CACHE is ON!!!')
         let cachedInfo = this.cacheLru.get(id) // {actualUntil, actualAge, failReason}
         let fetch = async () => {
            if (fetchFunc) {
               let processFetchErrorFunc = async (err) => {
                  if (err === 'queued item was evicted legally') { // ничего не делаем
                     logW(f, `Данные не получены(${id})! запрос на сервер был отброшен(легально) по причне переполнения очереди!`, err)
                  } else {
                     logE(`Данные не получены (${id})! Произошла ошибка. Через минуту  можно пробовать еще. err=`, err)
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
                  let existingRxDoc = await this.db.cache.findOne(id).exec()
                  let existingItem = existingRxDoc ? existingRxDoc.toJSON().cached.data : null
                  let notEvict = fetchRes.notEvict || (existingRxDoc ? existingRxDoc.props.notEvict : false) // если у старой сущности стоял notEvict - храним его
                  let res = await this.set(id, fetchRes.item, fetchRes.actualAge, notEvict, fetchRes.mangoQuery)
                  logD(f, 'записаны в кэш')
                  if (onFetchFunc) {
                     await onFetchFunc(existingItem, fetchRes.item)
                  }
                  return res
               }
               if (clientFirst && (cachedInfo && !cachedInfo.failReason)) { // если данные есть - не ждем ответа сервера (вернуть то что есть) Потом данные реактивно обновятся
                  logD(f, 'запрашиваем данные с сервера асинхронно...')
                  fetchFunc().then(saveFunc).catch(processFetchErrorFunc)
               } else { // ждем ответа сервра
                  try {
                     logD(f, 'запрашиваем данные с сервера синхронно...', clientFirst, cachedInfo)
                     await saveFunc(await fetchFunc())
                  } catch (err) {
                     await processFetchErrorFunc(err)
                  }
               }
            }
         }
         if (force || !this.isActual(id, cachedInfo)) { // данные отсутствуют в кэше, либо устарели
            await fetch()
         }
         let rxDoc = await this.db.cache.findOne(id).exec() // выполняем строго после fetchFunc!!! (findOne может выполняться очень долго(ломается логика QueryAccumulator))
         if (cachedInfo && !rxDoc) { // наблюдается баг (в cacheLru запись есть, а в rxdb - нет) Не разобрался до конца как это происходит... Возможно это связано с ручной очисткой storage
            logW(f, 'record has in cacheLru but not in rxdb!', cachedInfo)
            clientFirst = false // ждем отвера сервера
            await fetch()
            rxDoc = await this.db.cache.findOne(id).exec()
         }
         if (!rxDoc) {
            logD(f, 'not found', rxDoc, cachedInfo)
            if (cachedInfo && cachedInfo.failReason) {
               cachedInfo = this.cacheLru.get(id) || cachedInfo // изменилось actualUntil
               let tryAfter = Math.max(0, (cachedInfo.actualUntil - Date.now()) / 1000)
               throw new Error(`При извлечении id=${id} из БД произошла ошибка можно попробовать через ${Math.ceil(tryAfter)} сек. failReason=` + cachedInfo.failReason)
            }
            return null
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, rxDoc)
         return rxDoc
      } finally {
         // this.release()
      }
   }

   async expire (id) {
      try {
         await this.lock('rxdb::cache::expire')
         let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
         if (actualUntil) this.cacheLru.set(id, { actualUntil: Date.now(), actualAge: 0 })
      } finally {
         this.release()
      }
   }
}

export { Cache }
