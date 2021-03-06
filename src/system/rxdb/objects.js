// сцепляет запросы и отправляет пачкой
import { assert, wait } from 'src/system/common/utils'
import { ObjectApi } from 'src/api/object'
import { updateRxDocPayload } from 'src/system/rxdb/reactive'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { makeId, rxdb } from 'src/system/rxdb'
import { RxCollectionEnum } from 'src/system/rxdb/common'
import debounce from 'lodash/debounce'
import cloneDeep from 'lodash/cloneDeep'
import { ObjectTypeEnum } from 'src/system/common/enums'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.RXDB_OBJ)

const QUEUE_MAX_SZ = 111 // макимальное число сущностей в очереди на запрос
const QUEUE_MAX_SZ_PRELOAD = 22 // макимальное число сущностей в очереди на запрос на предзагрузку
const BATCH_SZ = 55 // сколько за раз запрашивать с сервера
class QueryAccumulator {
   constructor () {
      this.queueMaster = []
      this.queueSecondary = []
      this.queueSz = (queue) => {
         let set = new Set(queue.map(item => item.oid))
         return set.size
      }
      this.nextDebounced = debounce((reject) => {
         try {
            this.next()
         } catch (err) {
            reject(err)
         }
      }, 300, { maxWait: 1500 })
   }

   // Данные были запрошены, но уже не нужны. отменит запрос во всех очередях. Если queryId не указано, то отменит все
   cancel (queryId = null) {
      let canceledItems = [...this.queueMaster, ...this.queueSecondary]
      if (queryId) canceledItems = canceledItems.filter(item => item.queryId === queryId)
      for (let item of canceledItems) item.reject('queued item was evicted by cancel')
      if (queryId) {
         this.queueMaster = this.queueMaster.filter(item => item.queryId !== queryId)
         this.queueSecondary = this.queueSecondary.filter(item => item.queryId !== queryId)
      } else {
         this.queueMaster = this.queueSecondary = []
      }
      logD('cancel queue. size=', this.queueSz(this.queueMaster), this.queueMaster.length, Array.from(new Set(this.queueMaster.map(item => item.oid))))
      return null
   }

   // вернет промис, который выполнится когда-то... (когда данные запросятся и вернутся)
   push (oid, priority, queryId) {
      assert(queryId)
      assert(oid && (priority === 0 || priority === 1), 'oid && priority' + oid + priority)
      return new Promise((resolve, reject) => {
         let queue
         let queueMaxSz = 0
         if (priority === 0) {
            queue = this.queueMaster
            queueMaxSz = QUEUE_MAX_SZ
         } else if (priority === 1) {
            queue = this.queueSecondary
            queueMaxSz = QUEUE_MAX_SZ_PRELOAD
         }
         assert(queue && queueMaxSz)

         // if (queue.findIndex(item => item.oid === oid) === -1) { так нельзя!!!!! нельзя терять resolve'ры
         //   queue.push({ oid, resolve, reject })
         // }
         queue.push({ oid, resolve, reject, queryId }) // сохраняем КАЖДЫЙ запрос (даже если oid повторяются). каждый надо разрезолвить либо реджектить
         logD('push queue. size=', this.queueSz(queue), queue.length, Array.from(new Set(queue.map(item => item.oid))))
         while (this.queueSz(queue) > queueMaxSz) {
            let firstItem = queue.shift()
            let { oid, resolve, reject } = firstItem
            logW('переполнение очереди. priority=', priority, this.queueSz(queue))
            reject('queued item was evicted by queue overflow')
         }
         // ждем, параллельных вызовов(чтобы выполнить пачкой). Иначе, первый запрос пойдет отдельно, а остальные - пачкой
         // wait(500).then(() => this.next()).catch(reject)
         this.nextDebounced(reject)
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
      if (this.queryInProgress) return // если предыдущий запрос еще выполняется, то подождем...
      this.queryInProgress = true // Не более одного запроса в единицу времени
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
      if (oidsForQuery.length === 0) {
         this.queryInProgress = false
         return
      }
      // logD('next. oidsForQuery=', oidsForQuery)
      ObjectApi.objectList(oidsForQuery).then(async objectList => {
         for (let oid of oidsForQuery) {
            let object = objectList.find(obj => obj.oid === oid)
            // объект был только что получен. надо его разрезолвить и удалить из всех очередей (кроме того он мог попасть дважды в одну и ту же очередь)
            if (object /* && !object.deletedAt */) {
               this.resolveItem(object)
            } else if (object && !object.deletedAt) {
               this.rejectItem(oid, 'deleted')
            } else { // объекта нет на сервере (мы его запрашивали, но ничего не вернулось)
               // добавим в blackList (чтобы больше не запрашивали)
               await rxdb.hideObjectOrSource(oid, null)
               this.rejectItem(oid, 'notFound')
            }
         }
         // logD('!!!!!++++')
      })
         .catch(err => {
            logE('error on fetch objectList', err)
            for (let oid of oidsForQuery) this.rejectItem(oid, 'fetchError')
         })
         .finally(() => {
            this.queryInProgress = false
            this.next()
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

function makeObjectCacheId (item) {
   assert(item && item.oid, '!oid' + JSON.stringify(item))
   return RxCollectionEnum.OBJ + '::' + item.oid + '::{}'
}

function getOidFromId (id) {
   assert(id, '!id')
   let parts = id.split('::')
   assert(parts.length === 3, 'bad id' + id)
   let oid = parts[1]
   assert(oid, '!oid')
   return oid
}

// класс для запроса списков и отдельных объектов
class Objects {
   async clear () {
      assert(this.created)
      this.queryAccumulator.cancel() // отменим все запросы в очереди
   }

   async create (cache) {
      this.cache = cache
      this.queryAccumulator = new QueryAccumulator()
      this.created = true
   }

   // Вернет объект из кэша, либо запросит его. и вернет промис, который ВОЗМОЖНО когда-то выполнится(когда дойдет очередь);
   // Если в данный момент какой-либо запрос уже выполняется, то поставит в очередь.
   // priority 0 - будут выполнены QUEUE_MAX_SZ последних запросов. Запрашиваются пачками по 24 штук. Последние запрошенные - в первую очередь
   // priority 1 - только если очередь priority 0 пуста. будут выполнены последние 4 запроса
   // priority -1 - если есть - вернет из кэша (с сервера запрашивать не будет)
   // cancel - отменить запрос на сервер если это возможно (используется при прокрутке ленты)
   // queryId - чтобы понимать какие запросы потом отменять
   async get (id, notEvict, priority, clientFirst, force, onFetchFunc = null, queryId = null, cancel = false) {
      if (cancel) return this.queryAccumulator.cancel(queryId)
      const fetchFunc = async () => {
         logD('objects::get::fetchFunc start')
         let promise = this.queryAccumulator.push(getOidFromId(id), priority, queryId)
         let result = await promise
         result.notEvict = notEvict
         logD('objects::get::fetchFunc complete')
         return result
      }
      const f = this.get
      logD(f, 'start', id)
      let rxDoc = await this.cache.get(id, priority >= 0 ? fetchFunc : null, clientFirst, force, onFetchFunc)
      if (!rxDoc) return null // см "queued item was evicted by queue overflow"
      assert(rxDoc.cached, '!rxDoc.cached')
      return rxDoc
   }

   // от сервера прилетел эвент (поправим данные в кэше)
   async processEvent (event) {
      const f = this.processEvent
      logD(f, 'start', event)
      const t1 = performance.now()
      switch (event.type) {
         case 'OBJECT_CHANGED': {
            // if (!event.path /* || (event.path === 'uploadStage' && event.value === 'COMPLETE') */) { // объект изменился целиком
            //    let obj = await rxdb.get(RxCollectionEnum.OBJ, event.object.oid, { force: true })
            // } else {
            //    await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), event.path, event.value, false)
            // }
            if (event.path === 'thumbUrl') {
               let { items: wsItems } = await rxdb.find({
                  selector: {
                     rxCollectionEnum: RxCollectionEnum.WS_ANY,
                     oid: event.object.oid
                  }
               })
               for (let wsItem of wsItems) wsItem.thumbUrl = event.value
            }
            let reactiveItem = await rxdb.get(RxCollectionEnum.OBJ, event.object.oid, { priority: -1 }) // берем только те что есть в кэше ( с сервера не запрашиваем)
            // logD('reactiveItem=', cloneDeep(reactiveItem), event.rev)
            if (reactiveItem && reactiveItem.rev < event.rev) { // только если ревизия объекта в эвенте > локальной
               assert(event.objectFull || event.path)
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid),
                  event.path, event.path ? event.value : event.objectFull,
                  false)
            } else logT('event ignored! local already updated') // например, если это мы сами меняли (например, через ObjectApi.blockUpdate)

            // найти и обновить ядра с этой композицией (сейчас ядра запрашиваются с композицией)
            if (event.object.type === ObjectTypeEnum.COMPOSITION){
               assert(event.relatedSphereOids)
               for (let oid of event.relatedSphereOids) {
                  let essence = await rxdb.get(RxCollectionEnum.OBJ, oid, {priority: -1}) // берем только те что есть в кэше ( с сервера не запрашиваем)
                  if (essence) {
                     assert(essence.type.in(ObjectTypeEnum.JOINT, ObjectTypeEnum.NODE))
                     let index = essence.items.findIndex(c => c.oid === event.object.oid)
                     assert(index >= 0)
                     essence.updateExtended(`items.${index}${event.path ? '.' : ''}` + event.path, event.path ? event.value : event.objectFull, false)
                  }
               }
            }
            break
         }
         case 'OBJECT_CREATED':
            assert(event.relatedSphereOids && Array.isArray(event.relatedSphereOids), 'event.relatedSphereOids')
            assert(event.object.type, '!event.object.type')
            if (event.subject.oid === rxdb.getCurrentUser().oid) { // если это мы создали
               logD('объект до обновления (фейковый вариант):', await rxdb.get(RxCollectionEnum.OBJ, event.object.oid))
               await rxdb.get(RxCollectionEnum.OBJ, event.object.oid, { force: true, clientFirst: true }) // обновит ядро в rxdb (изначально у нас был фейковый вариант)
               logD('объект после обновления:', await rxdb.get(RxCollectionEnum.OBJ, event.object.oid))
            }
            if (event.object.type === 'JOINT') { // создан новый джойнт. обновляем статистику джойнтов на ядре
               for (let oid of event.relatedSphereOids) {
                  let reactiveItem = await rxdb.get(RxCollectionEnum.OBJ, oid, { priority: -1 }) // берем только те что есть в кэше ( с сервера не запрашиваем)
                  if (reactiveItem && reactiveItem.type === 'NODE') {
                     reactiveItem.countStat.countJoints++
                  } // обновляем статистику джойнтов на ядре
               }
            }
            break
         case 'VOTED': {
            assert(event.rate && event.rateStat, 'bad event!')
            await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), 'rate', event.rate, true)
            await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), 'rateStat', event.rateStat, true)
            let countVotes = event.rateStat.reduce((acc, val) => {
               acc += val.count
               return acc
            }, 0)
            await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), 'countStat.countVotes', countVotes, true)
            // добавим голос пользователя в статистику
            await updateRxDocPayload(makeId(RxCollectionEnum.GQL_QUERY, 'objectStat', { oid: event.object.oid }), 'votes', votes => {
               logD('updateRxDocPayload objectStat TODO! обновить статистику голосованния', votes)
               assert(votes && Array.isArray(votes), '!stat.votes')
               let userVote = JSON.parse(JSON.stringify(event.subject))
               userVote.rate = event.rateUser
               userVote.weight = rxdb.getCurrentUser().weightVal
               userVote.date = Date.now()
               let indx = votes.findIndex(v => v.oid === rxdb.getCurrentUser().oid)
               if (indx >= 0) votes.splice(indx, 1)
               votes.push(userVote)
               return votes
            }, true)
            if (event.subject.oid === rxdb.getCurrentUser().oid) {
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), 'rateUser', event.rateUser, true)
            }
            break
         }
         case 'OBJECT_DELETED': {
            await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, event.object.oid), 'deletedAt', new Date(), false)
            assert(event.relatedSphereOids && Array.isArray(event.relatedSphereOids), 'event.relatedSphereOids')
            assert(event.object.type, '!event.object.type')
            if (event.object.type === 'JOINT') { // удален джойнт. обновляем статистику джойнтов на ядре
               for (let oid of event.relatedSphereOids) {
                  let reactiveItem = await rxdb.get(RxCollectionEnum.OBJ, oid, { priority: -1 }) // берем только те что есть в кэше ( с сервера не запрашиваем)
                  if (reactiveItem && reactiveItem.type === 'NODE') reactiveItem.countStat.countJoints = reactiveItem.countStat.countJoints ? reactiveItem.countStat.countJoints - 1 : 0 // обновляем статистику джойнтов на ядре
               }
            }
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
