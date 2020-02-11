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

// var keys = {}
export function setItem (state, { key, item }) {
  // if (keys[key]) {
  //   logD('GOT KEY: UPDATING')
  //   for (const p in item) {
  //     state.cachedItems[key][p] = item[p]
  //   }
  // } else {
  //   logD('NO KEY: CREATING')
  //   keys[key] = true
  //   Vue.set(state.cachedItems, key, item)
  // }
  // Vue.set(state.cachedItems, key, JSON.parse(JSON.stringify(item)))
  // if (item.oid === 'AsFglViDQRE=') logD('setItem: item', key)
  if (state.cachedItems[key]) {
    // if (item.oid === 'AsFglViDQRE=') logD('UPDATING', key)
    for (const p in item) {
      // if (state.cachedItems[key]) Vue.set(state.cachedItems[key], p, item[p])
      // state.cachedItems[key][p] = item[p]
      Vue.set(state.cachedItems[key], p, item[p])
    }
  } else {
    // if (item.oid === 'AsFglViDQRE=') logD('CREATING', key)
    Vue.set(state.cachedItems, key, item)
  }
  // logD('setItem: state.cachedItems[key]', state.cachedItems[key])
}

export function removeItem (state, key) {
  assert(state.cachedItems[key])
  delete state.cachedItems[key]
}
