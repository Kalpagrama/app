import Vue from 'vue'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)

export function stateSet (state, [key, val]) {
   if (!Object.prototype.hasOwnProperty.call(state, key)) {
      logE('cant find prop in store/ui state: ' + key)
      return
   }
   // assert(Object.prototype.hasOwnProperty.call(state, key), 'cant find prop: ' + key)
   state[key] = val
}

export function storesSet (state, [sid, val]) {
   Vue.set(state.stores, sid, val)
   // state.stores[sid] = val
}

export function storesDelete (state, sid) {
   Vue.delete(state.stores, sid)
   // delete state.stores[sid]
}
