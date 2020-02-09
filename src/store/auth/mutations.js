import Vue from 'vue'
import assert from 'assert'

export function init (state, authInfo) {
  state.initialized = true
  state.userIsAuthorized = authInfo.userIsAuthorized
  state.userIsConfirmed = authInfo.userIsConfirmed
  state.userOid = authInfo.userOid
}

export function stateSet (state, [key, val]) {
  // console.debug('asdasd')
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
