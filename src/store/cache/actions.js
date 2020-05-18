import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logI = getLogFunc(LogLevelEnum.INFO, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

let cache
export const init = async (context, cache_) => {
  // logD('cache/init')
  cache = cache_
  await cache.init()
  context.commit('init')
  // logD('cache/init done')
}
/*!
 * модуль для кэширования данных во вьюикс
 * реальный класс кэширования cache - src/boot/cache.js. Он умеет писать b в idb и в VUEX
 * во вьюикс - временный кэш. Постоянный - в boot/cache
 */
export const clear = async (context) => {
  assert(context.state.initialized, '!context.state.initialized')
  return await cache.clear()
}
// fetchItemFunc ф-я для получения данных с сервера
export const get = async (context, { key, fetchItemFunc, force }) => {
  assert(context.state.initialized, '!context.state.initialized')
  assert(typeof key === 'string', 'typeof key === string')
  return await cache.get(key, fetchItemFunc, force)
}

// updateItemFunc - ф-я для обновления данных на сервере (вернет обновленную сущность)
// если указана updateItemFunc, то должны быть и fetchItemFunc, mergeItemFunc
// Если path = ''  то newValue - это полный объект
// если actualAge не указан - вычислится на основе actualUntil (либо если объекта нет - поставится дефолтное)
// можно использовать ф-ю для добавления данных в кэш (в этом случае - updateItemFunc не указывается)
// если в кэше ничего нет - то значение возмется либо из newValue, либо из fetchItemFunc, либо defaultValue. Если ничего не указано - то ничего не произойдет
export const update = async (context, { key, path, newValue, setter, defaultValue, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc, debounceMsec }) => {
  assert(context.state.initialized, '!context.state.initialized')
  assert(key)
  assert(setter != null || newValue != null, 'setter != null || newValue != null')
  if (newValue) newValue = JSON.parse(JSON.stringify(newValue)) // иначе newValue станет реактивным, и его нельзя будет менять вне vuex
  path = path || ''
  return await cache.update(key, {path, newValue, setter, defaultValue, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc, debounceMsec})
}
export const expire = async (context, key) => {
  assert(context.state.initialized, '!context.state.initialized')
  assert(key && typeof key === 'string', 'key && typeof key')
  return await cache.expire(key)
}
