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
      dispose: async (key, { actualUntil, actualAge }) => {
        assert(actualUntil && actualAge >= 0)
        if (key === this.context.rootState.auth.userOid) { // кладем обратно! юзера нельзя удалять
          setTimeout(() => {
            let item = this.context.state.cachedItems[key] // данные лежат во vuex
            assert(item)
            this.cacheLru.set(key, { actualUntil, actualAge })
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
      this.cacheLru.set(key, { actualUntil, actualAge })
      this.context.commit('setItem', { key, item })
    }
  }

  // actualAge - сколько времени сущность актуальна (при первышении - будет попытка обновиться с сервера в первую очередь, а потом брать из кэша)
  async set (key, item, actualAge) {
    assert(key && item)
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
      case 'doNotTouch': {
        let current = this.cacheLru.get(key)
        if (current) {
          actualAge = current.actualUntil - Date.now()
        } else {
          actualAge = this.defaultActualAge
        }
      }
        break
      default:
        assert(actualAge == null || Number.isInteger(actualAge))
        if (actualAge == null) actualAge = this.defaultActualAge
        break
    }
    assert(actualAge >= 0)
    let actualUntil = Date.now() + actualAge
    this.cacheLru.set(key, { actualUntil, actualAge })
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
        await this.set(key, item, actualAge)
        logD('данные в кэше обновлены!')
        result = item
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
      let item = this.context.state.cachedItems[key] // данные лежат во vuex
      assert(item)
      result = item
    }
    if (!result) return null // см "queued object was evicted legally"
    if ('failReason' in result) throw new Error('cant fetch item: ' + result.failReason)
    return result
  }

  async update (key, path, newValue, setter, actualAge) {
    function setValue (obj, path, value, setter) {
      assert(obj && Array.isArray(path))
      path = path.filter(k => Boolean(k))
      let o = obj
      for (let i = 0; i < path.length - 1; i++) {
        let n = path[i]
        if (!(n in o)) o[n] = {}
        o = o[n]
      }
      if (setter) {
        assert(!value)
        logD('before setter:', o)
        value = path.length ? setter(o[path[path.length - 1]]) : setter(o)
      }
      if (path.length) {
        o[path[path.length - 1]] = value
      } else {
        obj = value
      }
      logD('setValue:', value)
      return obj
    }

    assert(key && path != null && (newValue || setter))
    let item = this.context.state.cachedItems[key]
    if (item && !item.failReason) {
      let updatedItem = setValue(item, path.split('.'), newValue, setter)
      await this.set(key, updatedItem, actualAge)
    }
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
  if (fullItem) {
    await cache.set(key, fullItem, actualAge || 'prolong')
  } else {
    await cache.update(key, path, newValue, setter, actualAge || 'zero')
  }
}
