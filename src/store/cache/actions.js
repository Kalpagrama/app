import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
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

class CachePersist {
  constructor (props) {
    this.persistStore = new Store('cachePersistStore', 'cache')
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

// в кэше хранятся только ключи. сами данные - во vuex
class Cache {
  constructor (context) {
    this.defaultActualAge = 1000 * 60 * 60 // 1 hour by default
    // TODO увеличить до 50 МБ после тестирования
    this.defaultCacheSize = 1 * 1024 * 1024 // 1Mb
    this.context = context
    this.cachePersist = new CachePersist()
    // используется для контроля места
    this.cacheLru = new LruCache({
      max: this.defaultCacheSize, // 50Mb
      length: function (n, key) {
        return JSON.stringify(n).length + key.length
      },
      maxAge: 0, // не удаляем объекты по возрасту (для того чтобы при неудачной попытке взять с сервера - вернуть из кэша)
      dispose: async (key, {actualUntil, actualAge}) => {
        assert(actualUntil && actualAge)
        if (key === this.context.rootState.auth.userOid) { // кладем обратно! юзера нельзя удалять
          setTimeout(() => {
            let item = this.context.state.cachedItems[key] // данные лежат во vuex
            assert(item)
            this.cacheLru.set(key, {actualUntil, actualAge})
          }, 0)
        } else { // удалить объект из indexed db и vuex
          await this.cachePersist.remove(key)
          this.context.commit('removeItem', key)
        }
      }
    })
  }

  async init () {
    assert(this.cacheLru.itemCount === 0)
    for (let key of await this.cachePersist.keys()) {
      let { item, actualUntil, actualAge } = await this.cachePersist.getItem(key)
      assert(item && actualUntil)
      this.cacheLru.set(key, {actualUntil, actualAge})
      this.context.commit('setItem', { key, item })
    }
  }

  // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
  async set (key, item, actualAge) {
    if (actualAge === 'zero') {
      actualAge = 0
    } else if (actualAge === 'minute') {
      actualAge = 1000 * 60
    } else if (actualAge === 'hour') {
      actualAge = 1000 * 60 * 60
    } else if (actualAge === 'day') {
      actualAge = 1000 * 60 * 60 * 24
    } else if (actualAge === 'week') {
      actualAge = 1000 * 60 * 60 * 24 * 7
    } else if (actualAge === 'month') {
      actualAge = 1000 * 60 * 60 * 24 * 30
    } else if (actualAge === 'year') {
      actualAge = 1000 * 60 * 60 * 24 * 360
    } else if (actualAge === 'prolong') {
      let current = this.cacheLru.get(key)
      if (current) actualAge = current.actualAge
      else actualAge = this.defaultActualAge
    } else if (actualAge === 'doNotTouch') {
      let current = this.cacheLru.get(key)
      if (current) actualAge = current.actualUntil - Date.now()
      else actualAge = this.defaultActualAge
    } else {
      assert(!actualAge || Number.isInteger(actualAge))
    }

    actualAge = actualAge || this.defaultActualAge
    let actualUntil = Date.now() + actualAge
    this.cacheLru.set(key, {actualUntil, actualAge})
    await this.cachePersist.setItem(key, { item, actualUntil, actualAge })
    this.context.commit('setItem', { key, item })
  }

  // recieveItemFunc - ф-я которая запросит сущность с бэкенда
  async get (key, fetchItemFunc) {
    assert(key && fetchItemFunc)
    let result
    let actualUntil = this.cacheLru.get(key)
    if (!actualUntil || Date.now() > actualUntil) { // данные отсутствуют в кэше, либо устарели
      logD('данные отсутствуют в кэше, либо устарели!')
      try {
        logD('запрашиваем данные с сервера...')
        let { item, actualAge } = await fetchItemFunc()
        logD('данные извлечены!')
        assert(item && actualAge)
        if (item.fetchError) actualAge = 'minute' // через минуту можно будет повторно попытаться запросить данные
        await this.set(key, item, actualAge)
        logD('данные в кэше обновлены!')
        result = item
      } catch (err) {
        if (err === 'queued object was evicted legally') {
          logD('очередь переполнилась', err)
        } else {
          logE('ошибка при попытке запросить данные!', err)
        }
        result = this.context.state.cachedItems[key] // пробуем вернуть хоть что-то (подходит для оффлайн режима)
      }
    } else {
      let item = this.context.state.cachedItems[key] // данные лежат во vuex
      assert(item)
      result = item
    }
    if (result) {
      if (result.notFound) {
        // на сервере такого объекта нет. В кэше лежит тепеь болванка (чтобы исключить ненужные повторые обращения)
        logE('object not found in server', result)
        result = null
      } else if (result.deletedAt) {
        logW('object was deleted', result)
        result = null // удаленные объекты не показываем
      } else if (result.fetchError) {
        // попытка получить объект с сервера закончилась неудачно. В кэше лежит тепеь болванка (чтобы исключить ненужные повторые обращения)
        // через минуту можно будет повторно запросить данные
        logE('an error occurred while getting the object', result)
        result = null
      }
    }
    return result
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

export const get = async (context, { key, fetchItemFunc }) => {
  assert(context.state.initialized)
  assert(typeof key === 'string')
  return await cache.get(key, fetchItemFunc)
}

export const update = async (context, { key, path, newValue, setter, fullItem, actualAge }) => {
  // обновить во вьюикс
  let updatedItem = context.commit('updateItem', { key, path, newValue, setter, fullItem })
  if (updatedItem){ // если сущность есть во вьюикс - обновить ее в кэше
    // todo мы во вьюикс уже обновили, но cache.set перезапишет еще раз
    actualAge = actualAge || (fullItem ? 'prolong' : 'zero')
    await cache.set(key, updatedItem, actualAge)
  }
}
