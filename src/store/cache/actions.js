import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logI = getLogFunc(LogLevelEnum.INFO, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

import LruCache from 'lru-cache'
import {
  Store,
  get as idbGet,
  set as idbSet,
  keys as idbKeys,
  del as idbDel,
  clear as idbClear
} from 'src/statics/scripts/idb-keyval/idb-keyval.mjs'

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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

class QueueUpdate {
  constructor (context) {
    this.context = context
    this.queries = []
    this.inProgress = false
  }

  push (key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc) {
    // удаляем неактуальные изменения, которые перекрыты текущим
    let newQueries = []
    for (let query of this.queries) {
      if (key === query.key) {
        if (path === query.path) continue // удаляем запросы у которых тот же путь
        if (!path && query.path) continue // Если меняется объект целиком - удаляем запросы у которых есть путь
      }
      newQueries.push(query)
    }
    this.queries = newQueries
    this.queries.push({ key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc })
    this.next().catch(err => {
      logE('cant update item on server1', { key, path, newValue }, err)
    })
  }

  async next (retryCount = 0) {
    if (retryCount > 3) return
    if (this.inProgress) return
    if (this.queries.length === 0) return
    let { key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc } = this.queries.shift()

    // пробуем обновить на сервере
    try {
      this.inProgress = true
      await this.update(key, path, updateItemFunc, fetchItemFunc, mergeItemFunc)
    } catch (err) {
      // todo после обновления страницы данные об изменениях пропадут!!!
      // кладем обратно
      this.queries.unshift({ key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc })
      //  todo сделать circuit breaker
      await wait(5000)
    } finally {
      this.inProgress = false
      this.next(++retryCount).catch(err => {
        logE('cant update item on server2', { key, path, newValue }, err)
      })
    }
  }

  async update (key, path, updateItemFunc, fetchItemFunc, mergeItemFunc) {
    assert(updateItemFunc && fetchItemFunc && mergeItemFunc)
    assert(this.context.state.cachedItems[key], 'изменяемый объект обязан быть в кэше')
    try {
      logD('try send query to server', this.context.state.cachedItems[key].revision)
      let { item: dbItem, actualAge } = await updateItemFunc(this.context.state.cachedItems[key])
      this.context.commit('cache/updateItem', { key, path: '', newValue: dbItem }, { root: true }) // изменяем во вьюикс
      await cache.set(key, this.context.state.cachedItems[key], actualAge) // обновляем в кэше измененную запись (оверхеда при повторном измении vuex не будет)
    } catch (err) {
      if (err.message.includes('VERSION_CONFLICT')) {
        logI('VERSION_CONFLICT. try merge with server data. try get server version...')
        let { item: serverItem } = await fetchItemFunc()
        logD('serverItem', serverItem)
        // пробуем слить локальную и серверную версию (бросит исключение в случае невозможности слияния)
        let mergedItem = mergeItemFunc(path, serverItem, this.context.state.cachedItems[key])
        logD('merge OK!', mergedItem)
        // еще раз попробуем обновить
        let { item: dbItem, actualAge } = await updateItemFunc(mergedItem)
        this.context.commit('cache/updateItem', { key, path: '', newValue: dbItem }, { root: true }) // изменяем во вьюикс
        await cache.set(key, this.context.state.cachedItems[key], actualAge) // обновляем в кэше измененную запись (оверхеда при повторном измении vuex не будет)
      } else {
        logE('cant update item on server')
        throw err
      }
    }
  }
}

// в кэше хранятся только ключи. сами данные - во vuex
class Cache {
  constructor (context) {
    this.queue = new QueueUpdate(context)
    this.defaultActualAge = 1000 * 60 * 60 // 1 hour by default
    // TODO увеличить до 50 МБ после тестирования
    this.defaultCacheSize = 1 * 1024 * 1024 // 1Mb
    this.context = context
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
        if (['authInfo', this.context.rootState.auth.userOid].includes(key)) {
          // кладем обратно! юзера нельзя удалять и authInfo должна жить вечно
          setTimeout(() => {
            let item = this.context.state.cachedItems[key] // данные лежат во vuex
            assert(item)
            this.cacheLru.set(key, { actualUntil, actualAge })
          }, 0)
        } else { // удалить объект из indexed db и vuex
          await this.cachePersist.remove(key)
          // В общем случае - мы не знаем - ссылается ли что-то в приложении на этот объект во вьюикс
          // поэтому при удалении элемента у кого то в приложении могут остаться копии(перестанут быть реактивными)
          this.context.commit('removeItem', key)
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
      this.context.commit('setItem', { key, item })
    }
  }

  async clear () {
    logD('clear cache')
    await this.cachePersist.clear()
    this.cacheLru.reset()
    this.context.commit('clear')
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
    // logD('actualAge', actualAge)
    // logD('actualUntil', actualUntil)
    this.cacheLru.set(key, { actualUntil, actualAge })
    await this.cachePersist.setItem(key, { item, actualUntil, actualAge, lastTouchDate: Date.now() })
    this.context.commit('setItem', { key, item })
    return this.context.rootState.cache.cachedItems[key]
  }

  // fetchItemFunc - ф-я которая запросит сущность с бэкенда
  async get (key, fetchItemFunc, force) {
    assert(key && fetchItemFunc)
    let result
    let cachedData = this.cacheLru.get(key)
    let { actualUntil, actualAge } = cachedData ? cachedData : {}
    if (force || !actualUntil || Date.now() > actualUntil) { // данные отсутствуют в кэше, либо устарели
      if (!force) logD('данные отсутствуют в кэше, либо устарели!')
      try {
        logD('запрашиваем данные с сервера...')
        let { item, actualAge } = await fetchItemFunc()
        logD('данные извлечены!')
        if (item) {
          assert(actualAge, `item && actualAge ${actualAge} ${item} `)
          await this.set(key, item, actualAge)
          logD('данные в кэше обновлены!')
          result = item
        }
      } catch (err) {
        if (err === 'queued object was evicted legally') {
          logD('очередь переполнилась', err)
        } else if (err === 'notFound') {
          logD('объект не найден на сервере', err)
          await this.set(key, { failReason: err }, 'year') // таких данных на сервере нет. Нечего больше их запрашивать
        } else if (err === 'fetchError') {
          logD('an error occurred while getting the object', err)
          let item = this.context.state.cachedItems[key] || { failReason: err }
          await this.set(key, item, 'minute')// ошибка при извлечении. Через минуту можно еще попробовать
        } else if (err === 'deleted') {
          logD('object was deleted', err)
          await this.set(key, { failReason: err }, 'year')// данные удалены. Нечего больше запрашивать
        } else {
          logE('неизвестная ошибка при попытке запросить данные!', err)
          let item = this.context.state.cachedItems[key] || { failReason: 'unknownError: ' + err.message }
          // TODO поставить 'minute'
          await this.set(key, item, 'zero')// ошибка при извлечении. Через минуту можно еще попробовать
        }
        result = this.context.state.cachedItems[key] // пробуем вернуть хоть что-то (подходит для оффлайн режима)
      }
    } else {
      let item = this.context.state.cachedItems[key] // данные лежат во vuex и они актуальны
      assert(item)
      // обновим lastTouchDate в фоне
      this.cachePersist.setItem(key, { item, actualUntil, actualAge, lastTouchDate: Date.now() })
        .catch(err => logE('cant update lastTouchDate', err))
      result = item
    }
    if (!result) return null // см "queued object was evicted legally"
    if ('failReason' in result) throw new Error('cant fetch item: ' + result.failReason)
    return result
  }

  // updateItemFunc - обновить данные на сервере
  // mergeItemFunc - ф-я для устранения мердж-конфликтов
  // newValue - это либо объект целиком, либо свойство объекта (тогда актуальны path и setter)
  async update (key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc) {
    // function setValue (obj, path, value, setter) {
    //   assert(obj && Array.isArray(path))
    //   path = path.filter(k => Boolean(k))
    //   let o = obj
    //   for (let i = 0; i < path.length - 1; i++) {
    //     let n = path[i]
    //     if (!(n in o)) o[n] = {}
    //     o = o[n]
    //   }
    //   if (setter) {
    //     assert(!value)
    //     logD('before setter:', o)
    //     value = path.length ? setter(o[path[path.length - 1]]) : setter(o)
    //   }
    //   if (path.length) {
    //     o[path[path.length - 1]] = value
    //   } else {
    //     obj = value
    //   }
    //   logD('setValue:', value)
    //   return obj
    // }
    //
    // // logD('Cache::update params:', {key, path, newValue, setter, actualAge})
    // assert(!updateItemFunc || (fetchItemFunc && mergeItemFunc), 'fetchItemFunc, mergeItemFunc нужны для устранения конфликтов')
    // // обновим данные в кэше
    // let updatedItem
    // if (path || setter) {
    //   // assert(newValue == null || typeof newValue === 'object')
    //   c
    //   assert(vuexItem)
    //   updatedItem = setValue(vuexItem, path.split('.'), newValue, setter)
    // } else {
    //   assert(newValue)
    //   updatedItem = newValue
    // }
    // // logD('Cache::update. updatedItem = ', updatedItem)
    // assert(updatedItem && !updatedItem.failReason)
    //
    // if (!updateItemFunc) {
    //   updatedItem = await cache.set(key, updatedItem, actualAge)
    //   return updatedItem
    // } else {
    //   assert(updatedItem.oid)
    //   updatedItem = await cache.set(key, updatedItem, 'year')// чтобы данные не устарели пока не ушел запрос на сервер(актуально для оффлайн версии)
    //   // обновим данные на сервере
    //   // todo накапливать изменения и делать запрос в фоне
    //   assert(fetchItemFunc && mergeItemFunc)
    //   try {
    //     updatedItem = await updateItemFunc(updatedItem)
    //   } catch (err) {
    //     // logE('todo: !!! err=', JSON.stringify(err))
    //     if (err.message.includes('VERSION_CONFLICT')) {
    //       logI('VERSION_CONFLICT. try merge with server data')
    //       // get current item objects/get
    //       let { item: serverItem, actualAge } = await fetchItemFunc()
    //       logD('serverItem', serverItem)
    //       // пробуем слить локальную и серверную версию (бросит исключение в случае невозможности слияния)
    //       let mergedItem = mergeItemFunc(path, serverItem, updatedItem)
    //       logI('merge OK!')
    //       logD('mergedItem', mergedItem)
    //       // еще раз попробуем обновить
    //       updatedItem = await updateItemFunc(mergedItem)
    //     } else {
    //       throw err
    //     }
    //   }
    //   assert(updatedItem)
    //   updatedItem = await cache.set(key, updatedItem, actualAge)
    //   logD('updatedItem 2!', updatedItem)
    //   return updatedItem
    // }

    let vuexItem = this.context.state.cachedItems[key]
    if (!vuexItem) {
      logD('item not found in cache (may be deleted on cache overflow)')
      if (!path) {
        vuexItem = await cache.set(key, newValue, actualAge)
      }// записываем в кэш - то, что есть
      else {
        assert(fetchItemFunc, '!fetchItemFunc')
        let { item: serverItem, actualAge } = await fetchItemFunc()
        assert(serverItem, '!serverItem')
        vuexItem = await cache.set(key, serverItem, actualAge) // записываем в кэш данные с сервера
      }
    }
    assert(vuexItem, '!vuexItem')
    this.context.commit('cache/updateItem', { key, path, newValue, setter }, { root: true }) // изменяем во вьюикс
    assert(vuexItem === this.context.state.cachedItems[key], 'vuexItem === this.context.state.cachedItems[key]')
    vuexItem = await cache.set(key, vuexItem, actualAge) // обновляем в кэше измененную запись (оверхеда при повторном измении vuex не будет)
    if (updateItemFunc) {
      assert(vuexItem, '!vuexItem')
      // чтобы данные не устарели пока не ушел запрос на сервер(актуально для оффлайн версии) - ставим actualAge = year
      // если данные устареют - они могут быть замененты свежими при очередном запросе get
      vuexItem = await cache.set(key, vuexItem, 'year')
      // обновим данные на сервере (в фоне)
      this.queue.push(key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc)
    }
    if (!vuexItem) logW('item not found in cache!')
    return vuexItem
  }

  async expire (key) {
    let item = this.context.state.cachedItems[key]
    if (item) return await this.set(key, item, 'zero')
  }
}

let cache

export const init = async (context) => {
  logD('cache/init')
  cache = new Cache(context)
  await cache.init()
  context.commit('init')
  logD('cache/init done')
}

export const clearCache = async (context) => {

}
// fetchItemFunc ф-я для получения данных с сервера
export const clear = async (context) => {
  assert(context.state.initialized)
  return await cache.clear()
}
export const get = async (context, { key, fetchItemFunc, force }) => {
  assert(context.state.initialized)
  assert(typeof key === 'string')
  return await cache.get(key, fetchItemFunc, force)
}

// updateItemFunc - ф-я для обновления данных на сервере (вернет обновленную сущность)
// если указана updateItemFunc, то должны быть и fetchItemFunc, mergeItemFunc
// Если path = ''  то newValue - это полный объект
// если actualAge не указан - вычислится на основе actualUntil (либо если объекта нет - поставится дефолтное)
export const update = async (context, { key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc }) => {
  if (!path) {
    assert(newValue, 'newValue exists')
    assert(newValue.revision, 'newValue.revision exists')
  }
  assert(key)
  assert(setter || newValue)
  newValue = JSON.parse(JSON.stringify(newValue))
  path = path || ''

  return await cache.update(key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc)
}

export const expire = async (context, { key }) => {
  assert(context.state.initialized)
  assert(typeof key === 'string')
  return await cache.expire(key)
}
