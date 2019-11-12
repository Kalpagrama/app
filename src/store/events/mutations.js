import assert from 'assert'

export function init(state, userEvents) {
  state.userEvents = userEvents
  state.initialized = true
}

export function addEvent(state, userEvent) {
  state.userEvents.push(userEvent)
}

export function stateSet(state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}
