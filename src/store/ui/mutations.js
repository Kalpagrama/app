import assert from 'assert'

export function stateSet(state, [key, val]) {
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}
