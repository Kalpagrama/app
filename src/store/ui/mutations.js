import Vue from 'vue'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)

function stateSet (state, [key, val]) {
   if (!Object.prototype.hasOwnProperty.call(state, key)) {
      logE('cant find prop in store/ui state: ' + key)
      return
   }
   // assert(Object.prototype.hasOwnProperty.call(state, key), 'cant find prop: ' + key)
   state[key] = val
}

export default { stateSet }
