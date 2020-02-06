import assert from 'assert'
import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema'
import Vue from 'vue'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export function init (state) {
  state.initialized = true
}

export function setItem (state, { key, item }) {
  state.cachedItems[key] = item
}

export function removeItem (state, key) {
  assert(state.cachedItems[key])
  delete state.cachedItems[key]
}

function setValue (obj, path, value, setter) {
  assert(obj && Array.isArray(path))
  let o = obj
  for (let i = 0; i < path.length - 1; i++) {
    let n = path[i]
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  if (setter) {
    assert(!value)
    value = setter(o[path[path.length - 1]])
  }
  o[path[path.length - 1]] = value
}

// обновит данные в кэше ()
export function updateItem (state, { key, path, newValue, setter, fullItem }) {
  assert(key && path && (newValue || setter))
  logD('cache/update mutation', key, path)
  let result
  if (path) {
    if (!state.cachedItems[key] && fullItem) state.cachedItems[key] = fullItem
    let object = state.cachedItems[key]
    if (object) {
      let p = path.split('.')
      setValue(object, p, newValue, setter)
      result = object
    }
  } else {
    assert(fullItem)
    state.cachedItems[key] = fullItem
    result = state.cachedItems[key]
  }
  logD('cache/update mutation complete', key, path)
  return result
}
