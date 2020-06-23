import assert from 'assert'
import Vue from 'vue'

export function stateSet(state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export function storesSet(state, [sid, val]) {
  Vue.set(state.stores, sid, val)
  // state.stores[sid] = val
}

export function storesDelete (state, sid) {
  Vue.delete(state.stores, sid)
  // delete state.stores[sid]
}
