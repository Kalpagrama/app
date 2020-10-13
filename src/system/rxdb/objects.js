// сцепляет запросы и отправляет пачкой
import assert from 'assert'
import { ObjectsApi } from 'src/api/objects'
import { updateRxDoc } from 'src/system/rxdb/reactive'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { RxCollectionEnum, rxdb, makeId } from 'src/system/rxdb/index'
import set from 'lodash/set'
import { wait } from 'src/system/utils'
import { mutexGlobal } from 'src/system/rxdb/mutex'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.RXDB_OBJ)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB_OBJ)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.RXDB_OBJ)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB_OBJ)

const QUEUE_MAX_SZ = 88 // макимальное число сущностей в очереди на запрос
const BATCH_SZ = 16 // сколько за раз запрашивать с сервера
class QueryAccumulator {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
    this.queueSz = (queue) => {
      let set = new Set(queue.map(item => item.oid))
      return set.size
    }
  }

  // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
  push (oid, priority) {
    assert(oid && priority >= 0, 'oid && priority' + oid + priority)
    return new Promise((resolve, reject) => {
      let queue
      let queueMaxSz = 0
      if (priority === 0) {
        queue = this.queueMaster
        queueMaxSz = QUEUE_MAX_SZ
      } else if (priority === 1) {
        queue = this.queueSecondary
        queueMaxSz = 4
      }
      assert(queue && queueMaxSz)

      // if (queue.findIndex(item => item.oid === oid) === -1) { так нельзя!!!!! нельзя терять resolve'ры
      //   queue.push({ oid, resolve, reject })
      // }
      queue.push({ oid, resolve, reject }) // сохраняем КАЖДЫЙ запрос (даже если oid повторяются)
      while (this.queueSz(queue) > queueMaxSz) {
        let firstItem = queue.shift()
        let { oid, resolve, reject } = firstItem
        reject('queued item was evicted legally')
      }
      // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
      wait(500).then(() => this.next()).catch(reject)
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
    const masterOids = this.queueMaster.map(item => item.oid)
    const secOids = this.queueSecondary.map(item => item.oid)
    // извлечь из очереди сдедующие объекты для запроса на сервер. Проверяем на наличие
    let oidsForQuery = [] // элементы для следующего запроса
    let totalOids = [] // элементы из всех очередей (самые приоритетные - в конце)
    for (let oid of secOids) {
      if (!totalOids.includes(oid)) totalOids.push(oid)
    }
    for (let oid of masterOids) {
      if (!totalOids.includes(oid)) totalOids.push(oid)
    }
    // берем последние добавленные (самые приоритетные - в конце)
    for (let i = totalOids.length - 1; i >= 0 && oidsForQuery.length < BATCH_SZ; i--) {
      if (!oidsForQuery.includes(totalOids[i])) oidsForQuery.push(totalOids[i])
    }
    if (oidsForQuery.length === 0) return
    this.queryInProgress = true // Не более одного запроса в единицу времени
    ObjectsApi.objectList(oidsForQuery).then(objectList => {
      this.queryInProgress = false
      for (let oid of oidsForQuery) {
        let object = objectList.find(obj => obj.oid === oid)
        // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
        if (object /* && !object.deletedAt */) {
          this.resolveItem(object)
        } else if (object && !object.deletedAt) {
          this.rejectItem(oid, 'deleted')
        } else {
          this.rejectItem(oid, 'notFound')
        }
      }
      this.next()
    })
      .catch(err => {
        this.queryInProgress = false
        logE('error on fetch objectList', err)
        for (let oid of oidsForQuery) this.rejectItem(oid, 'fetchError')
      })
  }
}

// очередь на отправку изменений на сервер.
class QueueUpdate {
  constructor () {
    this.queries = []
    this.inProgress = false
  }

  push (key, vuexItem, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc, debounceMsec = 1000) {
    assert(updateItemFunc && fetchItemFunc && mergeItemFunc && onUpdateFailsFunc, 'bad funcs')
    let itemForSend = JSON.parse(JSON.stringify(vuexItem)) // копия данных на момент отправки
    let newQuery = { key, itemForSend, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc }
    // удаляем неактуальные изменения, которые перекрыты текущим
    let indx = this.queries.findIndex(query => query.key === key)
    if (indx >= 0) {
      assert(this.queries[indx].debounceTimer, 'this.queries[indx].debounceTimer')
      clearTimeout(this.queries[indx].debounceTimer)
      this.queries[indx] = newQuery
    } else {
      this.queries.push(newQuery)
    }
    logD('изменения добавлены в очередь!')

    // ждем debounceMsec. На тот случай, если шлется подряд много измений. Например, выделяется range в видео-редакторе.
    // Избавляет от слишком частых отправок изменений одной сущности
    newQuery.debounceTimer = setTimeout(() => {
      this.next().catch(err => {
        logE('cant update item on server!', key, itemForSend, err)
      })
    }, debounceMsec)
  }

  async next (failCount = 0) {
    logD('разгребаем очередь...', failCount)
    if (failCount > 5) return

    if (this.inProgress) return
    if (this.queries.length === 0) {
      logD('очередь пуста. выходим.')
      return
    }
    let { key, itemForSend, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc } = this.queries.shift()

    // пробуем обновить на сервере
    try {
      this.inProgress = true
      logD(`изменения извлечены из очереди. попытка отправки№${failCount}. item:`, itemForSend)
      await this.updateItem(key, itemForSend, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc)
      failCount = 0 // изменения прошли удачно! сбрасываем failCount
      logD('изменения успешно отправлены')
    } catch (err) {
      if (!err.networkError) { // если ошибка не сетевая - выходим с неудачей
        logE('попытка отправки не удалась. Попыток больше не будет предпринято.', err)
        failCount = 100500
        onUpdateFailsFunc(err) // обновить не получится. Прекратить попытки
      } else { // если ошибка сетевая - пытаемся выполнить повторно
        // после обновления страницы данные об изменениях пропадут!!!
        // кладем обратно
        let timeout = Math.min(3000 * (failCount), 20 * 1000) // ждем (не не более 20 сек)
        logD(`попытка запроса не удалась по причине отсутствия сети. Попробуем через ${timeout / 1000}c`)
        this.queries.unshift({ key, itemForSend, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc })
        //  todo сделать circuit breaker
        ++failCount
        await wait(timeout)
      }
    } finally {
      this.inProgress = false
      await this.next(failCount)
    }
  }

  async updateItem (key, itemForSend, updateItemFunc, fetchItemFunc, mergeItemFunc) {
    assert(updateItemFunc && fetchItemFunc && mergeItemFunc)
    try {
      let { item: dbItem, actualAge } = await updateItemFunc(itemForSend)
    } catch (err) {
      if (err.message.includes('VERSION_CONFLICT')) {
        logW('отправка изменений не удалась! VERSION_CONFLICT. Пробуем получить версию сервера...')
        let { item: serverItem } = await fetchItemFunc()
        logD('версия сервера получена. Пытаемся слить ее с локальной версией. serverItem=', serverItem)
        let mergedItem = mergeItemFunc(serverItem, itemForSend) // бросит исключение в случае невозможности слияния
        logD('слияние прошло успешно. отправляем mergedItem на сервер...', mergedItem)
        let { item: dbItem, actualAge } = await updateItemFunc(mergedItem)
        await this.store.commit('cache/updateItem', { key, newValue: dbItem }, { root: true }) // изменяем во вьюикс
        logD('конфликт разрешен успешно!', mergedItem)
      } else {
        logE('не удалось оправить изменения на сервер!', err)
        throw err
      }
    }
  }
}

function makeObjectCacheId(item){
  assert(item && item.oid, '!oid' + JSON.stringify(item))
  return RxCollectionEnum.OBJ + '::' + item.oid
}

function getOidFromId(id){
  assert(id, '!id')
  let parts = id.split('::')
  assert(parts.length === 3, 'bad id' + id)
  let oid = parts[1]
  assert(oid, '!oid')
  return oid
}
// класс для запроса списков и отдельных объектов
class Objects {
  constructor (cache) {
    this.cache = cache
    this.queryAccumulator = new QueryAccumulator()
  }

  // Вернет объект из кэша, либо запросит его. и вернет промис, который ВОЗМОЖНО когда-то выполнится(когда дойдет очередь);
  // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
  // priority 0 - будут выполнены QUEUE_MAX_SZ последних запросов. Запрашиваются пачками по 16 штук. Последние запрошенные - в первую очередь
  // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
  async get (id, priority, clientFirst, force, onFetchFunc = null) {
    const fetchFunc = async () => {
      logD('objects::get::fetchFunc start')
      let promise = this.queryAccumulator.push(getOidFromId(id), priority)
      let result = await promise
      logD('objects::get::fetchFunc complete')
      return result
    }
    const f = this.get
    // logD(f, 'start')
    let rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force, onFetchFunc)
    if (!rxDoc) return null // см "queued item was evicted legally"
    assert(rxDoc.cached, '!rxDoc.cached')
    return rxDoc
  }

  // от сервера прилетел эвент (поправим данные в кэше)
  async processEvent (event) {
    assert(mutexGlobal.isLeader(), 'isLeader()')
    const f = this.processEvent
    logD(f, 'start', mutexGlobal.isLeader())
    const t1 = performance.now()
    if (!mutexGlobal.isLeader()) return
    switch (event.type) {
      case 'OBJECT_CHANGED': {
        await updateRxDoc(makeId(RxCollectionEnum.OBJ, event.object.oid), 'cached.data' + event.path ? '.' : '' + event.path, event.value, false)
        break
      }
      case 'VOTED': {
        await updateRxDoc(makeId(RxCollectionEnum.OBJ, event.object.oid), 'cached.data.rate', event.rate, false)
        break
      }
      case 'OBJECT_DELETED': {
        await updateRxDoc(makeId(RxCollectionEnum.OBJ, event.object.oid), 'cached.data.deletedAt', new Date(), false)
        break
      }
      default:
        throw new Error(`unsupported Event ${event.type}`)
    }
    let { type, wsItem: itemServer, wsRevision } = event
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  }
}

export { Objects, makeObjectCacheId }
