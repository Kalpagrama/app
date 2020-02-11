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

// let indx_ = 0

export function setItem (state, { key, item }) {
  // if (item.oid === 'AsANtV_BQBo=') logD(`setItem: start key=${key}, item.indx=${item.indx_} indx_=${indx_}. item= `, item)
  let existing = state.cachedItems[key]
  if (existing) {
    // if (item.oid === 'AsANtV_BQBo=') logD('setItem: exist')
    // Object.assign(state.cachedItems[key], item)
    for (let prop in item) {
      Vue.set(existing, prop, item[prop])
      // existing[prop] = item[prop]
    }
  } else {
    // logD('setItem: !exist')
    // if (item.oid === 'AsANtV_BQBo=') logD('setItem: !exist', state.cachedItems)
    Vue.set(state.cachedItems, key, item)
    // Vue.set(state.cachedItems[key], 'indx_', indx_++)
    // if (item.oid === 'AsANtV_BQBo=') logD('setItem: created!')
  }
  // setInterval(() => {
  //   state.cachedItems[key].name = state.cachedItems[key].name + '-'
  // }, 1000)
  // logD('setItem: state.cachedItems[key]', state.cachedItems[key])
}

export function removeItem (state, key) {
  // if (key.includes('AsANtV_BQBo=')) logD('setItem: removeItem!')
  logD('removeItem', key)
  // assert(state.cachedItems[key])
  // delete state.cachedItems[key]
}
