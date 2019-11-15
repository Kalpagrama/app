import assert from 'assert'

export function init(state, userEvents) {
  state.userEvents = userEvents
  state.initialized = true
}

export function addEvent(state, userEvent) {
  userEvent.uid = Date.now().toString()
  state.userEvents.unshift(userEvent)
  state.userEvents.splice(888, state.userEvents.length)
}

export function stateSet(state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}
