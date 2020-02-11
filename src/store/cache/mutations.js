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
  state.cachedItems = {}
}

export function setItem (state, { key, item }) {
  let existing = state.cachedItems[key]
  if (existing) {
    for (let prop in item) {
      Vue.set(existing, prop, item[prop])
      existing[prop] = item[prop]
    }
  } else {
    Vue.set(state.cachedItems, key, item)
  }
}

export function removeItem (state, key) {
  assert(state.cachedItems[key])
  delete state.cachedItems[key]
}
