import assert from 'assert'

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}
