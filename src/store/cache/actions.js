import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Cache } from './caches'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logI = getLogFunc(LogLevelEnum.INFO, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

let cache
export const init = async (context) => {
  logD('cache/init')
  cache = new Cache(context)
  await cache.init()
  context.commit('init')
  logD('cache/init done')
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
  assert(key)
  assert(setter != null || newValue != null)
  if (!path && !setter) assert(newValue.revision, 'newValue.revision exists')
  if (newValue) newValue = JSON.parse(JSON.stringify(newValue)) // иначе newValue станет реактивным, и его нельзя будет менять вне vuex
  path = path || ''
  return await cache.update(key, path, newValue, setter, actualAge, updateItemFunc, fetchItemFunc, mergeItemFunc)
}
export const expire = async (context, { key }) => {
  assert(context.state.initialized)
  assert(typeof key === 'string')
  return await cache.expire(key)
}
