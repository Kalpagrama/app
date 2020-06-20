import assert from 'assert'

export function stateSet(state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export function dataSet(state, [key, val]) {
  state.data[key] = val
}
