import assert from 'assert'
import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema'
import Vue from 'vue'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import logger from 'vuex/dist/logger'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export function init (state) {
  state.initialized = true
}

export function clear (state) {
  logD('CACHE: clear')
  state.cachedItems = {}
}

export function setItem (state, { key, item }) {
  let existing = state.cachedItems[key]
  if (existing === item) return // оптимтизация (один и тот же объект)
  if (existing) {
    for (let prop in item) {
      Vue.set(existing, prop, item[prop])
    }
  } else {
    Vue.set(state.cachedItems, key, item)
  }
}

// изменит
export function updateItem (state, { key, path, newValue, setter }) {
  // logD('cache/updateItem', { key, path, newValue, setter })
  let obj = state.cachedItems[key]
  if (!obj) return
  if (obj === newValue) return // оптимтизация (один и тот же объект)
  path = path.split('.')
  path = path.filter(k => Boolean(k))
  let o = obj
  for (let i = 0; i < path.length - 1; i++) {
    let n = path[i]
    if (!(n in o)) o[n] = {}
    o = o[n]
  }
  if (setter) {
    assert(newValue == null, '!newValue')
    // logD('before setter:', o)
    newValue = path.length ? setter(o[path[path.length - 1]]) : setter(o)
  } else assert(newValue != null, 'newValue != null')
  if (path.length) { // изменилась часть объекта
    let prop = path[path.length - 1]
    Vue.set(o, prop, newValue)
  } else { // изменился весь объект
    assert(typeof newValue === 'object', 'typeof newValue === object')
    for (let prop in newValue) {
      Vue.set(obj, prop, newValue[prop])
    }
  }
}

export function removeItem (state, key) {
  assert(state.cachedItems[key], 'state.cachedItems[key]')
  delete state.cachedItems[key]
}
