import Vue from 'vue'
import {assert} from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.VUEX_CORE)

function stateSet (state, [key, val]) {
  assert(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export default { stateSet }
