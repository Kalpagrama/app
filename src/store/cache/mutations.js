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

export function setItem (state, {key, item}){
  state.cachedItems[key] = item
}
export function removeItem (state, key){
  assert(state.cachedItems[key])
  delete state.cachedItems[key]
}
