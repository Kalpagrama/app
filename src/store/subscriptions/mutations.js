import assert from 'assert'

export function init (state, userSubscriptions) {
  state.userSubscriptions = userSubscriptions
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  state[key] = val
}

export function subscribe (state, oid) {
  assert.ok(state.userSubscriptions.indexOf(oid) === -1)
  state.userSubscriptions.push(oid)
}

export function unSubscribe (state, oid) {
  let index = state.userSubscriptions.findIndex(s => s.oid === oid)
  assert.ok(index >= 0)
  state.userSubscriptions.splice(index, 1)
}
