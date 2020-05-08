import Vue from 'vue'
import assert from 'assert'

export function init (state, authInfo) {
  assert(authInfo, '!authInfo')
  assert(authInfo.userOid, '!authInfo.userOid')
  assert(authInfo.userIsAuthorized, '!authInfo.userIsAuthorized')
  assert(authInfo.userIsConfirmed, '!authInfo.userIsConfirmed')
  state.initialized = true
  state.userIsAuthorized = authInfo.userIsAuthorized
  state.userIsConfirmed = authInfo.userIsConfirmed
  state.userOid = authInfo.userOid
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  if (val) {
    Vue.set(state, key, val)
  }
}
