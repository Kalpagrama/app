import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
import Vue from 'vue'

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert(Object.prototype.hasOwnProperty.call(state, key), 'bad prop: ' + key + JSON.stringify(val))
  state[key] = val
}
