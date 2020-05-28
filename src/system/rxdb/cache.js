import { createRxDatabase, isRxDocument, removeRxDatabase } from 'rxdb'
import LruCache from 'lru-cache'
import assert from 'assert'
import { schemaKeyValue, cacheSchema } from 'src/system/rxdb/schemas'
import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Mutex, ReactiveItemHolder } from 'src/system/rxdb/reactive'
import { WsCollectionEnum } from 'src/system/rxdb/workspace'
import { fragments } from 'src/schema'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_CACHE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_CACHE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_CACHE)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_CACHE)

const CacheItemTypeEnum = Object.freeze({ OBJ: 'OBJ', LST: 'LST' })

const purgePeriod = 1000 * 60 * 60 * 24 // раз в сутки очищать бд от мертвых строк
// TODO увеличить до 50 МБ после тестирования
const lruDumpPeriod = 1000 * 60 * 8 // периодически(раз в 8 минут) сохраняем LRU в idb
const defaultActualAge = 1000 * 60 * 60 // время жизни объекта в кэше (по умолчанию)
// TODO увеличить до 50 МБ после тестирования
const defaultCacheSize = 1 * 1024 * 1024 // 1Mb // todo увеличить!
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// класс для кэширования gql запросов
class Cache {
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
          await this.db.cache.find().where('id').eq(id).remove() //  удалим из rxdb
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
  async setItem (id, item, actualAge) {
    assert(this.created, '!this.created')
    assert(id && item, `id && item ${id} ${item}`)
    let f = this.getItem
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
    const rxDoc = await this.db.cache.atomicUpsert({ id, item }) // сохраняем в rxdb
    return rxDoc
  }

  // вернет из кэша, в фоне запросит данные через fetchFunc. может вернуть null
  async getItem (id, fetchFunc, force) {
    assert(this.created, '!this.created')
    assert(id)
    let f = this.getItem
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
            this.setItem(id, rxDoc.item || { failReason: err }, 'minute')
          }
        }
        let saveFunc = async (fetchRes) => {
          assert(fetchRes, '!fetchRes')
          assert('item' in fetchRes && 'actualAge' in fetchRes, 'bad fetchRes')
          logD(f, `данные с сервера получены ${fetchRes.item.oid}`)
          let res = await this.setItem(id, fetchRes.item, fetchRes.actualAge)
          logD(f, `записаны в кэш${fetchRes.item.oid}`)
          return res
        }
        logD(f, 'запрашиваем данные с сервера...')
        if (rxDoc && !rxDoc.failReason) { // если данные есть - не ждем ответа сервера (вернуть то что есть) Потом данные реактивно обновятся
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
    if (!rxDoc) { // см "queued item was evicted legally"
      logD(f, 'not found', rxDoc)
      return null
    }
    if (rxDoc.failReason) {
      let { actualUntil, actualAge } = this.cacheLru.get(id) || {}
      let tryAfter = Math.max(0, (actualUntil - Date.now()) / 1000)
      throw new Error(`При извлечении из БД произошла ошибка можно попробовать через ${Math.ceil(tryAfter)} сек` + rxDoc.failReason)
    }
    logD(f, 'complete', rxDoc)
    return rxDoc
  }
}

// сцепляет запросы и отправляет пачкой
class QueryAccumulator {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
  }

  // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
  push (oid, priority) {
    assert(oid && priority >= 0, 'oid && priority')
    return new Promise((resolve, reject) => {
      let queue
      let queueMaxSz = 0
      if (priority === 0) {
        queue = this.queueMaster
        queueMaxSz = 20
      } else if (priority === 1) {
        queue = this.queueSecondary
        queueMaxSz = 4
      }
      assert(queue && queueMaxSz)
      if (queue.findIndex(item => item.oid === oid) === -1) {
        queue.push({ oid, resolve, reject })
      }
      while (queue.length > queueMaxSz) {
        let firstItem = queue.shift()
        let { oid, resolve, reject } = firstItem
        reject('queued item was evicted legally')
      }
      // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
      wait(100).then(() => this.next()).catch(reject)
    })
  }

  // вызывать после получения объекта с сервера. разрезолвит объект во всех очередях
  resolveItem (object) {
    assert(object && object.oid)
    const resolveObject = (queue, object) => {
      assert(queue && Array.isArray(queue))
      for (let { oid, resolve, reject } of queue) {
        if (oid === object.oid) {
          let result = {
            item: object,
            actualAge: 'hour'
          }
          resolve(result)
        }
      }
      return queue.filter(item => item.oid !== object.oid)
    }
    this.queueMaster = resolveObject(this.queueMaster, object)
    this.queueSecondary = resolveObject(this.queueSecondary, object)
  }

  rejectItem (oid, err) {
    assert(oid && err)
    const rejectObject = (queue, objOid, err) => {
      assert(queue && Array.isArray(queue))
      for (let { oid, resolve, reject } of queue) {
        if (oid === objOid) {
          reject(err)
        }
      }
      return queue.filter(item => item.oid !== objOid)
    }
    this.queueMaster = rejectObject(this.queueMaster, oid, err)
    this.queueSecondary = rejectObject(this.queueSecondary, oid, err)
  }

  // берет из очереди последний добавленный и отправляет на выполненеие
  next () {
    // если предыдущий запрос еще выполняется, то подождем...
    if (this.queryInProgress) return
    // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
    let itemsForQuery = [] // элементы для следующего запроса
    let totalQuery = [] // элементы из всех очередей (самые приоритетные - в конце)
    for (let itemSec of this.queueSecondary) {
      if (totalQuery.findIndex(item => item.oid === itemSec.oid) === -1) totalQuery.push(itemSec)
    }
    for (let itemMas of this.queueMaster) {
      if (totalQuery.findIndex(item => item.oid === itemMas.oid) === -1) totalQuery.push(itemMas)
    }
    // берем последние добавленные (самые приоритетные - в конце)
    for (let i = totalQuery.length - 1; i >= 0 && itemsForQuery.length < 5; i--) {
      let queuedItem = totalQuery[i]
      if (itemsForQuery.findIndex(item => item.oid === queuedItem.oid) >= 0) continue // такой уже есть
      itemsForQuery.push(queuedItem)
    }
    if (itemsForQuery.length === 0) return
    this.queryInProgress = true // Не более одного запроса в единицу времени

    apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment}
        query objectList ($oids: [OID!]!) {
          objectList(oids: $oids) {
            ... objectFullFragment
          }
        }
      `,
      variables: {
        oids: itemsForQuery.map(item => item.oid)
      }
    })
    .then(result => {
      this.queryInProgress = false
      let objectList = result.data.objectList
      for (let item of itemsForQuery) {
        let object = objectList.find(obj => obj.oid === item.oid)
        // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
        if (object && !object.deletedAt) {
          this.resolveItem(object)
        } else if (object && !object.deletedAt) {
          this.rejectItem(item.oid, 'deleted')
        } else {
          this.rejectItem(item.oid, 'notFound')
        }
      }
      this.next()
    })
    .catch(err => {
      this.queryInProgress = false
      logE('error on fetch objectList', err)
      for (let item of itemsForQuery) this.rejectItem(item.oid, 'fetchError')
    })
  }
}

// класс для запроса списков и отдельных объектов
class ObjectQueries {
  constructor (cache) {
    this.cache = cache
    this.queryAccumulator = new QueryAccumulator()
    this.getItemTypeById = (id) => {
      let keyParts = id.split('::')
      assert(keyParts.length === 2 && keyParts[0] in CacheItemTypeEnum, 'bad id' + id)
      return keyParts[0]
    }
    this.makeListId = (mangoQuery) => CacheItemTypeEnum.LST + '::' + JSON.stringify(mangoQuery)
    this.makeObjectId = (oid) => CacheItemTypeEnum.OBJ + '::' + oid
  }

  // вернет реактивный список (все элементы списка - тоже реактивны)
  async find (mangoQuery) {
    return { rxQuery: null, reactiveList: null }
  }

  // вернет реактивный объект
  async findOne (oid) {
    let fetchObjectFunc = async () => {
      let { data: { objectFull } } = await apollo.clients.api.query({
        query: gql`
          ${fragments.objectFullFragment}
          query objectFull ($oid: OID!) {
            objectFull(oid: $oid) {
              ... objectFullFragment
            }
          }
        `,
        variables: { oid }
      })
      return {
        item: objectFull,
        actualAge: 'day'
      }
    }
    let rxDoc = await this.cache.getItem(this.makeObjectId(oid), fetchObjectFunc)
    if (!rxDoc) throw new Error('объект не найден на сервере')
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return { rxDoc, reactiveItem: reactiveItemHolder.reactiveItem.item }
  }

  // Вернет объект из кэша, либо запросит его. и вернет промис, который ВОЗМОЖНО когда-то выполнится(когда дойдет очередь);
  // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
  // priority 0 - будут выполнены 20 последних запросов. Запрашиваются пачками по 5 штук. Последние запрошенные - в первую очередь
  // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
  async findOneQueue (oid, priority) {
    const fetchItemFunc = async () => {
      let promise = this.queryAccumulator.push(oid, priority)
      return await promise
    }
    let rxDoc = await this.cache.getItem(this.makeObjectId(oid), fetchItemFunc)
    if (!rxDoc) return { rxDoc: null, reactiveItem: null } // см "queued item was evicted legally"
    assert(rxDoc.item, '!rxDoc.item')
    let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
    return { rxDoc, reactiveItem: reactiveItemHolder.reactiveItem.item }
  }

  // от сервера прилетел эвент
  async processEvent (event) {
    try {
      await this.mutex.lock()
      const f = this.processEvent
      logD(f, 'start')
      if (!this.isLeader) return
      let { type, wsItem: itemServer, wsRevision } = event
      logD(f, 'complete')
    } finally {
      this.mutex.release()
    }
  }
}

export { Cache, ObjectQueries }
