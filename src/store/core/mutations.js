import Vue from 'vue'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX_CORE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX_CORE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX_CORE)

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export function processEvent (state, event){
  switch (event.type){
    case 'PROGRESS':
      if (state.progressInfo[event.action] === undefined) {
        Vue.set(state.progressInfo, event.action, {})
      }
      Vue.set(state.progressInfo[event.action], event.oid, event.progress)
      logD('progress event! progressInfo===' + state.progressInfo[event.action][event.oid])
      break
    default:
      break
  }
}
