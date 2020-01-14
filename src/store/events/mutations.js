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

export function addEvent(state, {event, context: { rootState, commit }}) {
  logD('addEvent', event)
  // event.uid = Date.now().toString()
  commit('objects/update', {
    oid: rootState.objects.currentUser.oid,
    path: 'events',
    setter: (oldValue) => {
      let events = oldValue
      events.unshift(event)
      events.splice(888, events.length)
      return events
    }
  }, { root: true })

  // userEvent.uid = Date.now().toString()
  // state.userEvents.unshift(userEvent)
  // state.userEvents.splice(888, state.userEvents.length)
}
