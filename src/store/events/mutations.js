import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export function init(state) {
  state.initialized = true
}

export function stateSet(state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

// todo куда добавлять эвенты (user.events не существует)
export function addEvent(state, {event, context: { rootState, commit }}) {
  logD('addEvent', event)
  logE('not implemented!')
  // commit('cache/updateItem', {
  //   key: rootState.auth.userOid,
  //   path: 'events',
  //   setter: (oldValue) => {
  //     let events = oldValue
  //     events.unshift(event)
  //     events.splice(888, events.length)
  //     return events
  //   }
  // }, { root: true })
}
