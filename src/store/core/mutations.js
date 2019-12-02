import assert from 'assert'

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}
