import assert from 'assert'
import LruCache from 'lru-cache'
import {
  clear as idbClear,
  del as idbDel,
  get as idbGet,
  keys as idbKeys,
  set as idbSet,
  Store
} from 'public/scripts/idb-keyval/idb-keyval.mjs'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { wait } from 'src/system/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX_CACHE)
const logI = getLogFunc(LogLevelEnum.INFO, LogSystemModulesEnum.VUEX_CACHE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX_CACHE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX_CACHE)

// todo DEPRECATED!!!!! модуль не нужен (не выкинул - тк код рабочий и может пригодиться)

// долговременное(между запусками) хранилище объектов
class CachePersist {
  constructor (props) {
    this.persistStore = new Store('vuexPersistStore', 'cache')
  }

  async clear () {
    return await idbClear(this.persistStore)
  }

  async getItem (key) {
    return await idbGet(key, this.persistStore)
  }

  async setItem (key, value) {
    return await idbSet(key, value, this.persistStore)
  }

  async keys () {
    return await idbKeys(this.persistStore)
  }

  async remove (key) {
    return await idbDel(key, this.persistStore)
  }
}

// очередь на отправку изменений на сервер.
class QueueUpdate {
  constructor (store) {
    assert(store)
    this.store = store
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
        logI('отправка изменений не удалась! VERSION_CONFLICT. Пробуем получить версию сервера...')
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

// в cacheLru хранятся только ключи. сами данные - во vuex и CachePersist
class Cache {
  constructor (store) {
    this.queue = new QueueUpdate(store)
    this.defaultActualAge = 1000 * 60 * 60 // 1 hour by default
    this.defaultCacheSize = 50 * 1024 * 1024 // 1Mb
    this.store = store
    this.cachePersist = new CachePersist()
    // используется для контроля места
    this.cacheLru = new LruCache({
      max: this.defaultCacheSize,
      length: function (n, key) {
        return JSON.stringify(n).length + key.length
      },
      maxAge: 0, // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
      noDisposeOnSet: true,
      dispose: async (key, { actualUntil, actualAge }) => {
        assert(actualUntil && actualAge >= 0, `actualUntil && actualAge >= 0 ${actualUntil} ${actualAge}`)
        if (!this.clearInProgress && ['wsLocalChanges', 'authInfo', this.store.state.auth.userOid].includes(key)) {
          // кладем обратно! юзера нельзя удалять + authInfo должна жить вечно
          // wsLocalChanges - изменения в мастерской, которые еще не ушли на сервер
          setTimeout(() => {
            let item = this.store.state.cache.cachedItems[key] // данные лежат во vuex
            assert(item)
            this.cacheLru.set(key, { actualUntil, actualAge })
          }, 0)
        } else { // удалить объект из indexed db и vuex
          await this.cachePersist.remove(key)
          // В общем случае - мы не знаем - ссылается ли что-то в приложении на этот объект во вьюикс
          // поэтому при удалении элемента у кого то в приложении могут остаться копии(перестанут быть реактивными)
          this.store.commit('cache/removeItem', key, { root: true })
        }
      }
    })
  }

  async init () {
    assert(this.cacheLru.itemCount === 0)

    let idbItems = []
    for (let key of await this.cachePersist.keys()) {
      let { item, actualUntil, actualAge, lastTouchDate } = await this.cachePersist.getItem(key)
      idbItems.push({ key, item, actualUntil, actualAge, lastTouchDate })
    }
    // сортируем по возрастанию даты последнего обращения
    idbItems.sort((left, right) => {
      return left.lastTouchDate - right.lastTouchDate
    })
    // добавляем в cacheLru и vuex (самые последние запрошенные - в конце (save "recently used"-ness of the key))
    // это конечно не сохраняет LRU в полной мере... Но хоть что-то
    for (let idbItem of idbItems) {
      let { key, item, actualUntil, actualAge, lastTouchDate } = idbItem
      assert(key && item && actualUntil)
      this.cacheLru.set(key, { actualUntil, actualAge })
      this.store.commit('cache/setItem', { key, item }, { root: true })
    }
  }

  async clear () {
    logD('clear cache')
    this.clearInProgress = true
    await this.cachePersist.clear()
    this.cacheLru.reset()
    this.store.commit('cache/clear', { root: true })
    delete this.clearInProgress
    logD('cache clear OK!')
  }

  // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
  async set (key, item, actualAge) {
    assert(key && item, `key && item ${key} ${item}`)
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
        let current = this.cacheLru.get(key)
        if (current) {
          actualAge = current.actualAge
        } else {
          actualAge = this.defaultActualAge
        }
      }
        break
      default: {
        if (!Number.isInteger(actualAge)) {
          // такой элемент уже есть в кэше оставляем что было
          let current = this.cacheLru.get(key)
          if (current) {
            actualAge = Math.max(0, current.actualUntil - Date.now())
          } else {
            actualAge = this.defaultActualAge
          }
          assert(actualAge == null || Number.isInteger(actualAge))
          if (actualAge == null) actualAge = this.defaultActualAge
        }
        break
      }
    }
    assert(Number.isInteger(actualAge) && actualAge >= 0, `Number.isInteger(actualAge):${actualAge}`)
    let actualUntil = Date.now() + actualAge
    this.cacheLru.set(key, { actualUntil, actualAge })
    await this.cachePersist.setItem(key, { item, actualUntil, actualAge, lastTouchDate: Date.now() })
    this.store.commit('cache/setItem', { key, item }, { root: true })
    return this.store.state.cache.cachedItems[key]
  }

  // fetchItemFunc - ф-я которая запросит сущность с бэкенда
  async get (key, fetchItemFunc, force) {
    assert(key && fetchItemFunc, 'key && fetchFunc')
    let result
    let { actualUntil, actualAge } = this.cacheLru.get(key) || {}
    if (force || !actualUntil || Date.now() > actualUntil) { // данные отсутствуют в кэше, либо устарели
      if (!force) logD('данные отсутствуют в кэше, либо устарели!', key)
      try {
        logD('запрашиваем данные с сервера...')
        let fetchRes = await fetchItemFunc()
        assert('item' in fetchRes, 'item not in fetchRes!')
        assert('actualAge' in fetchRes, 'actualAge not in fetchRes!')
        let { item, actualAge } = fetchRes
        logD('данные с сервера получены', item)
        if (item) {
          logD('Обновляем кэш...')
          assert(actualAge, `item && actualAge ${actualAge} ${item} `)
          result = await this.set(key, item, actualAge)
        }
      } catch (err) {
        if (err === 'queued object was evicted legally') {
          logD('Данные не получены! запрос на сервер был отброшен(легально) по причне переполнения очереди!', err)
        } else if (err === 'notFound') {
          logW('Данные не получены! объект не найден на сервере', err)
          await this.set(key, { failReason: err }, 'year') // таких данных на сервере нет. Нечего больше их запрашивать
        } else if (err === 'fetchError') {
          logD('Данные не получены! Произошла ошибка. Через минуту  можно пробовать еще. err=', err)
          let item = this.store.state.cache.cachedItems[key] || { failReason: err }
          await this.set(key, item, 'minute')// ошибка при извлечении. Через минуту можно еще попробовать
        } else if (err === 'deleted') {
          logD('Данные не получены! Объект был удален!', err)
          await this.set(key, { failReason: err }, 'year')// данные удалены. Нечего больше запрашивать
        } else {
          logE('Данные не получены! неизвестная ошибка. Через минуту  можно пробовать еще. err=', err)
          let item = this.store.state.cache.cachedItems[key] || { failReason: 'unknownError: ' + err.message }
          await this.set(key, item, 'minute')// ошибка при извлечении. Через минуту можно еще попробовать
        }
        result = this.store.state.cache.cachedItems[key] // пробуем вернуть хоть что-то (подходит для оффлайн режима)
      }
    } else {
      let item = this.store.state.cache.cachedItems[key] // данные лежат во vuex и они актуальны
      assert(item)
      // обновим lastTouchDate в фоне
      this.cachePersist.setItem(key, { item, actualUntil, actualAge, lastTouchDate: Date.now() })
        .catch(err => logE('cant update lastTouchDate', err))
      result = item
    }
    if (!result) return null // см "queued object was evicted legally"
    if (typeof result === 'object' && 'failReason' in result) throw new Error('cant fetch item: ' + result.failReason)
    return result
  }

  // updateItemFunc - обновить данные на сервере
  // mergeItemFunc - ф-я для устранения мердж-конфликтов
  // newValue - это  объект целиком, либо свойство объекта (тогда актуален path)
  // подождет debounceMsec перед отправкой на сервер. Отправится только последний вариант
  // updateItemFunc - ф-я для обновления данных на сервере (вернет обновленную сущность)

// если указана updateItemFunc, то должны быть и fetchItemFunc, mergeItemFunc
// Если path = ''  то newValue - это полный объект
// если actualAge не указан - вычислится на основе actualUntil (либо если объекта нет - поставится дефолтное)
// можно использовать ф-ю для добавления данных в кэш (в этом случае - updateItemFunc не указывается)
// если в кэше ничего нет - то значение возмется либо из newValue, либо из fetchItemFunc, либо defaultValue. Если ничего не указано - то ничего не произойдет

  async update (key, { path, newValue, setter, defaultValue, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc, debounceMsec }) {
    let vuexItem = this.store.state.cache.cachedItems[key]
    if (!vuexItem) { // в кэше ничего не нашлось. Либо не было изначально, либо было удалено при переполнении кэша
      if (!path && newValue) { // меняется целиком
        vuexItem = await this.set(key, newValue, actualAge)
      }// записываем в кэш - то, что есть
      else if (fetchItemFunc) { // берем с сервера
        let { item: serverItem, actualAge } = await fetchItemFunc()
        assert(serverItem, '!serverItem')
        vuexItem = await this.set(key, serverItem, actualAge) // записываем в кэш данные с сервера
      } else if (defaultValue) {
        vuexItem = await this.set(key, defaultValue, actualAge)
      }
    }
    this.store.commit('cache/updateItem', { key, path, newValue, setter }, { root: true }) // изменяем во вьюикс
    assert(vuexItem === this.store.state.cache.cachedItems[key], 'vuexItem === this.store.state.cache.cachedItems[key]')
    if (vuexItem) vuexItem = await this.set(key, vuexItem, actualAge) // обновляем в кэше измененную запись(actualAge) (оверхеда при повторном измении vuex не будет)
    if (updateItemFunc) {
      // чтобы данные не устарели пока не ушел запрос на сервер(актуально для оффлайн версии) - ставим actualAge = year
      // если данные устареют - они могут быть замененты свежими при очередном запросе get
      if (vuexItem) vuexItem = await this.set(key, vuexItem, 'year')
      // обновим данные на сервере (в фоне)
      if (vuexItem) this.queue.push(key, vuexItem, updateItemFunc, fetchItemFunc, mergeItemFunc, onUpdateFailsFunc, debounceMsec)
    }
    if (!vuexItem) logW('item not found in cache!')
    return vuexItem
  }

  async expire (key) {
    let item = this.store.state.cache.cachedItems[key]
    if (item) return await this.set(key, item, 'zero')
  }
}

let cache
export default async ({ Vue, store, router: VueRouter }) => {
  try {
    cache = new Cache(store)
    await store.dispatch('cache/init', cache, { root: true })
  } catch (err) {
    logE(err)
  }
}

export { cache }
