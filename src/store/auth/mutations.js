import Vue from 'vue'
import assert from 'assert'

export function init(state, { userIsAuthorized, userIsConfirmed, user }) {
  state.initialized = userIsConfirmed ? true : false
  state.userIsAuthorized = userIsAuthorized
  state.userIsConfirmed = userIsConfirmed
  state.userOid = user.oid
}

export function stateSet(state, [key, val]) {
  // console.debug('asdasd')
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
