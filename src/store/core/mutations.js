import Vue from 'vue'
import {assert} from 'src/system/common/utils'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX_CORE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX_CORE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX_CORE)

function stateSet (state, [key, val]) {
  assert(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export default { stateSet }
