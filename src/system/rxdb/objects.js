// сцепляет запросы и отправляет пачкой
import assert from 'assert'
import { ObjectsApi } from 'src/api/objects'
import { ReactiveItemHolder, getReactive } from 'src/system/rxdb/reactive'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb/index'
import set from 'lodash/set'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.RXDB_OBJ)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB_OBJ)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.RXDB_OBJ)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogModulesEnum.RXDB_OBJ)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const QUEUE_MAX_SZ = 20
class QueryAccumulator {
  constructor () {
    this.queueMaster = []
    this.queueSecondary = []
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
      if (queue.findIndex(item => item.oid === oid) === -1) {
        queue.push({ oid, resolve, reject })
      }
      while (queue.length > queueMaxSz) {
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
    ObjectsApi.objectList(itemsForQuery.map(item => item.oid)).then(objectList => {
      this.queryInProgress = false
      for (let item of itemsForQuery) {
        let object = objectList.find(obj => obj.oid === item.oid)
        // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
        if (object /* && !object.deletedAt */) {
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
    if (failCount > 5) return
    logD('разгребаем очередь...', failCount)

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
        logD(`попытка отправки не удалась по причине отсутствия сети. Попробуем через ${timeout / 1000}c`)
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
  assert(parts.length === 2, 'bad id' + id)
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

  // // вернет реактивный объект
  // async findOne (oid) {
  //   let fetchFunc = async () => {
  //     return {
  //       type: CacheItemTypeEnum.OBJ,
  //       item: await ObjectsApi.objectFull(oid),
  //       actualAge: 'day'
  //     }
  //   }
  //   let rxDoc = await this.cache.get(makeObjectCacheId({oid}), fetchFunc)
  //   if (!rxDoc) throw new Error('объект не найден на сервере')
  //   let reactiveItemHolder = new ReactiveItemHolder(rxDoc)
  //   return { rxDoc, reactiveItem: reactiveItemHolder.reactiveItem.cached.data }
  // }

  // Вернет объект из кэша, либо запросит его. и вернет промис, который ВОЗМОЖНО когда-то выполнится(когда дойдет очередь);
  // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
  // priority 0 - будут выполнены QUEUE_MAX_SZ последних запросов. Запрашиваются пачками по 5 штук. Последние запрошенные - в первую очередь
  // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
  async get (id, priority, clientFirst, force) {
    const fetchFunc = async () => {
      // logD('objects::get::fetchFunc start')
      let promise = this.queryAccumulator.push(getOidFromId(id), priority)
      return await promise
    }
    // logD('objects::get start')
    let rxDoc = await this.cache.get(id, fetchFunc, clientFirst, force)
    if (!rxDoc) return null // см "queued item was evicted legally"
    assert(rxDoc.cached, '!rxDoc.cached')
    return rxDoc
  }

  // от сервера прилетел эвент (поправим данные в кэше)
  async processEvent (event) {
    assert(rxdb.isLeader(), 'rxdb.isLeader()')
    const f = this.processEvent
    logD(f, 'start', rxdb.isLeader())
    if (!rxdb.isLeader()) return
    switch (event.type) {
      case 'OBJECT_CHANGED': {
        let objectFullReactive = await rxdb.get(RxCollectionEnum.OBJ, event.object.oid)
        if (objectFullReactive) {
          set(objectFullReactive, event.path, event.value)
        }
        break
      }
      case 'VOTED': {
        let objectFullReactive = await rxdb.get(RxCollectionEnum.OBJ, event.object.oid)
        if (objectFullReactive) {
          logD(f, `try edit rate. rateUser= ${objectFullReactive.rateUser}`)
          objectFullReactive.rate = event.rate
          logD(f, `try edit rate complete. rateUser= ${objectFullReactive.rateUser}`)
        }
        break
      }
      case 'OBJECT_DELETED': {
        let objectFullReactive = await rxdb.get(RxCollectionEnum.OBJ, event.object.oid)
        if (objectFullReactive) {
          objectFullReactive.deletedAt = new Date()
        }
        break
      }
      default:
        throw new Error(`unsupported Event ${event.type}`)
    }
    let { type, wsItem: itemServer, wsRevision } = event
    logD(f, 'complete')
  }
}

export { Objects, makeObjectCacheId }
