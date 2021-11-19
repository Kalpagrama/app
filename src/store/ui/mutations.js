import Vue from 'vue'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.VUEX)

function stateSet (state, [key, val]) {
   if (!Object.prototype.hasOwnProperty.call(state, key)) {
      logE('cant find prop in store/ui state: ' + key)
      return
   }
   // assert(Object.prototype.hasOwnProperty.call(state, key), 'cant find prop: ' + key)
   state[key] = val
}

export default { stateSet }
