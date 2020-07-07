import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_CORE)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_CORE)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_CORE)

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
      // logD('progress event received!', event)
      assert(event.action, '')
      if (!state.progressInfo[event.action]) state.progressInfo[event.action] = {}
      state.progressInfo[event.action][event.oid] = event.progress
      logD('progress event! progressInfo=', state.progressInfo)
      break
    default:
      break
  }
}
