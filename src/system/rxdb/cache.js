import LruCache from 'lru-cache'
import { assert } from 'src/system/common/utils'
import { cacheSchema } from 'src/system/rxdb/schemas'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { mutexGlobal } from 'src/system/rxdb/mutex_global'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import debounce from 'lodash/debounce'
import { getRxCollectionEnumFromId, rxdb } from 'src/system/rxdb'
import { rxdbOperationProxyExec } from 'src/system/rxdb/common'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB_CACHE)

const debounceIntervalDumpLru = 1000 * 10 // сохраняем весь LRU в idb с дебаунсом 10 сек
const defaultActualAge = 1000 * 60 * 60 // время жизни объекта в кэше (по умолчанию час)
const defaultCacheSize = 50 * 1024 * 1024 // кэш в rxdb
if (defaultCacheSize < 50 * 1024 * 1024) logW('TODO увеличить кэш до 50 МБ после тестирования')

const DEBUG_IGNORE_CACHE = false // если === true - брать из сети (игнорить кэш)

// класс для кэширования gql запросов
class Cache {
   constructor () {
      this.mutex = new MutexLocal('rxdb::cache')
   }

   async destroy () {
      if (this.created && this.db) { // пересоздание
         try {
            await this.lock('destroy')
            if (this.db.cache) await rxdbOperationProxyExec(this.db.cache, 'destroy')
            this.db = null
            this.fastCache = null
            if (this.cacheLru) this.cacheLru.reset() // после this.db.cache = null
            this.cacheLru = null
            this.created = false
         } finally {
            this.release()
         }
      }
   }

   async create (db) {
      const f = this.create
      logD(f, 'start')
      const t1 = performance.now()
      assert(db, '!rxdb')
      try {
         await this.lock('recreate')
         this.db = db
         assert(!this.created, 'this.created')

         await this.db.addCollections({ cache: { schema: cacheSchema } })
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

         // кэш только что вставленных элементов (нужен тк после вставки тут же будут запрошены эти элементы и это обычно долго)
         this.fastCache = {}
         this.fastCache.insert = (rxDoc) => {
            if (!this.fastCache[rxDoc.id]) {
               this.fastCache[rxDoc.id] = rxDoc
               this.fastCache.list = this.fastCache.list || []
               let deleted = this.fastCache.list.splice(88, this.fastCache.list.length) // удалим старые
               for (let deletedId of deleted) delete this.fastCache[deletedId]
            }
         }
         this.fastCache.get = (id) => this.cacheLru.get(id) ? this.fastCache[id] : null

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
               if (this.db && this.db.cache) {
                  assert(actualUntil && actualAge >= 0, `actualUntil && actualAge >= 0 ${actualUntil} ${actualAge}`)
                  let rxDoc = this.fastCache.get(id) || await rxdbOperationProxyExec(this.db.cache, 'findOne', id)
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
            }
         })

         // заполняем cacheLru из idb
         // let lruDump = await rxdb.get(RxCollectionEnum.META, 'lruDump') так не делаем чтобы reactiveItem не дергался каждый раз при измнении
         let lruDumpDoc = await rxdbOperationProxyExec(rxdb.db.meta, 'findOne', 'lruDump')
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
            // logW('todo skip debouncedDumpLru')
            // return
            // eslint-disable-next-line no-unreachable
            const t1 = performance.now()
            let lruDump = this.cacheLru.dump()
            let lruDumpStr = JSON.stringify(lruDump)
            await rxdbOperationProxyExec(this.db.meta, 'atomicUpsert', {
               id: 'lruDump',
               valueString: lruDumpStr
            })
            logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         }, debounceIntervalDumpLru, { maxWait: 60 * 1000 })

         // из-за debounce сохранения - на старте может оказаться, что в rxdb запись есть, а в lru - нет!
         for (let rxDoc of await rxdbOperationProxyExec(this.db.cache, 'find')) {
            if (!this.cacheLru.get(rxDoc.id)) {
               this.cacheLru.set(rxDoc.id, {
                  actualUntil: Date.now() + debounceIntervalDumpLru,
                  actualAge: defaultActualAge
               })
            }
         }
         this.created = true
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      } finally {
         this.release()
      }
   }

   async recreate (db) {
      const f = this.recreate
      logD(f, 'start')
      const t1 = performance.now()
      assert(db, '!rxdb')
      await this.destroy()
      await this.create(db)
   }

   async lock (lockOwner) {
      await this.mutex.lock(lockOwner)
   }

   release () {
      this.mutex.release()
   }

   async find (mangoQuery) {
      return await rxdbOperationProxyExec(this.db.cache, 'find', mangoQuery)
   }

   // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
   //   cached: {data} data может быть как объектом, так и любым другим типом
   async set (id, data, actualAge, notEvict, mangoQuery = {}) {
      assert(this.created, '!this.created')
      assert(id && data, '!id && data' + id + JSON.stringify(data))
      let rxCollectionEnum = getRxCollectionEnumFromId(id)
      const f = this.set
      // logD(f, 'start', id)
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
         case 'infinity':
            actualAge = 1000 * 60 * 60 * 24 * 360 * 100
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
      this.fastCache.insert(rxDoc) // сохраним для быстрого ответа
      // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return rxDoc
   }

   // если вставлять через atomicUpsert, то на большом числе документов случаются тормоза (один апсерт длится до 5 секунд и они сериализуются)
   // (PS уже неактуально (используется LokiJS)) - можно перейти на обычный апсерт
   async upsertRxDocDebounce (plainDoc) {
      if (!this.debouncedBatchUpdate) {
         this.debouncedBatchUpdate = debounce(async () => {
            const f = this.debouncedBatchUpdate
            f.nameExtra = 'debouncedBatchUpdate'
            // logD(f, 'start')
            const t1 = performance.now()
            try {
               await this.lock('rxdb::cache::set')
               let debouncedUpdateQueueCopy = this.debouncedUpdateQueue
               this.debouncedUpdateQueue = [] // пока debouncedBatchUpdate выполняется, - очередь может пополняться
               try {
                  let insertedPlainDocs = {}
                  for (let { plainDoc } of debouncedUpdateQueueCopy) insertedPlainDocs[plainDoc.id] = plainDoc
                  // let all = await this.db.cache.find().exec()
                  // logD(f, `start3_1_1 t = ${Math.floor(performance.now() - t1)} msec, all`)
                  let t2 = performance.now()
                  // let updatedRxDocs = await this.db.cache.find({ selector: { id: { $in: Object.keys(insertedPlainDocs) } } }).exec() // эти обновляем
                  let updatedRxDocs = Array.from((await rxdbOperationProxyExec(this.db.cache, 'findByIds', Object.keys(insertedPlainDocs))), ([name, value]) => value);
                  let findByIdsTm = performance.now() - t2
                  t2 = performance.now()
                  for (let updated of updatedRxDocs) {
                     let inserted = insertedPlainDocs[updated.id]
                     assert(inserted, '!inserted')
                     await rxdbOperationProxyExec(this.db.cache, 'atomicUpsert', inserted)
                     delete insertedPlainDocs[updated.id]
                  }
                  let atomicUpsertTm = performance.now() - t2
                  t2 = performance.now()
                  let {
                     success,
                     error
                  } = await rxdbOperationProxyExec(this.db.cache, 'bulkInsert', Object.values(insertedPlainDocs)) // оставшиеся вставляем
                  let bulkInsertTm = performance.now() - t2
                  success.push(...updatedRxDocs)
                  for (let { plainDoc, resolve, reject } of debouncedUpdateQueueCopy) {
                     let rxDocUpdated = success.find(rxDoc => rxDoc.id === plainDoc.id)
                     if (rxDocUpdated) resolve(rxDocUpdated)
                     else {
                        reject('bulkInsert error! debouncedUpdateQueueCopy=' + JSON.stringify({
                           debouncedUpdateQueueCopy,
                           success,
                           error
                        }))
                     }
                  }
                  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec (findByIdsTm=${Math.floor(findByIdsTm)} atomicUpsertTm= ${Math.floor(atomicUpsertTm)} bulkInsertTm=${Math.floor(bulkInsertTm)})`)
               } catch (err) {
                  logE('cant debouncedUpdateQueue', err)
                  for (let { reject } of this.debouncedUpdateQueue) reject(err)
               }
            } finally {
               this.release()
            }
         }, 300, { leading: false, maxWait: 8888 })
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
      let res = cachedInfo && (cachedInfo.actualAge === 'infinity' || Date.now() <= cachedInfo.actualUntil)
      // logD('res = ', res)
      return res
   }

   // вернет из кэша, в фоне запросит данные через fetchFunc. может вернуть null
   async get (id, fetchFunc = null, clientFirst = true, force = false, onFetchFunc = null) {
      try {
         // await this.lock('rxdb::get') ! нельзя тк необходимо чтобы запросы выполнялись параллельно (см QueryAccumulator)
         assert(this.created, '!this.created')
         assert(id)
         const f = this.get
         // logD(f, 'start', id)
         const t1 = performance.now()
         if (DEBUG_IGNORE_CACHE) logW(f, 'DEBUG_IGNORE_CACHE is ON!!!')
         let cachedInfo = this.cacheLru.get(id) // {actualUntil, actualAge, failReason}
         let fetch = async () => {
            if (fetchFunc) {
               let processFetchErrorFunc = async (err) => {
                  if (err === 'queued item was evicted by queue overflow') { // ничего не делаем
                     logW(f, `Данные не получены(${id})! запрос на сервер был отброшен(легально) по причне переполнения очереди!`, err)
                  } else if (err === 'queued item was evicted by cancel') { // ничего не делаем
                     logD(f, `Данные не получены(${id})! запрос на сервер был отменен (cancel queryId)!`, err)
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
                  let existingRxDoc, existingItem
                  let notEvict = fetchRes.notEvict
                  if (this.cacheLru.get(id)) { // такой итем уже есть в кэше...
                     existingRxDoc = this.fastCache.get(id) || await rxdbOperationProxyExec(this.db.cache, 'findOne', id)
                     existingItem = existingRxDoc ? existingRxDoc.toJSON().cached.data : null
                     notEvict = notEvict || (existingRxDoc ? existingRxDoc.props.notEvict : false) // если у старой сущности стоял notEvict - храним его
                  }
                  let res = await this.set(id, fetchRes.item, fetchRes.actualAge, notEvict, fetchRes.mangoQuery)
                  // logD(f, 'записаны в кэш')
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
                     // logD(f, 'запрашиваем данные с сервера синхронно...', clientFirst, cachedInfo)
                     await saveFunc(await fetchFunc())
                  } catch (err) {
                     await processFetchErrorFunc(err)
                  }
               }
            }
         }
         if (force || !this.isActual(id, cachedInfo)) { // данные отсутствуют в кэше, либо устарели
            logD(f, 'rxdb cache miss! goto backend...', force, this.isActual(id, cachedInfo), cachedInfo, Date.now())
            await fetch()
         }
         let rxDoc = this.fastCache.get(id) || await rxdbOperationProxyExec(this.db.cache, 'findOne', id) // выполняем строго после fetchFunc!!! (findOne может выполняться очень долго(ломается логика QueryAccumulator))
         if (cachedInfo && !rxDoc) { // наблюдается баг (в cacheLru запись есть, а в rxdb - нет) Не разобрался до конца как это происходит... Возможно это связано с ручной очисткой storage
            logW(f, 'record has in cacheLru but not in rxdb!', cachedInfo)
            clientFirst = false // ждем отвера сервера
            await fetch()
            rxDoc = this.fastCache.get(id) || await rxdbOperationProxyExec(this.db.cache, 'findOne', id)
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
         // logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, rxDoc)
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
