import Vue from 'vue'
import assert from 'assert'

export function init(state, user) {
  state.user = user
  state.initialized = true
}

export function stateSet(state, [key, val]) {
  // console.debug('asdasd')
  assert.ok(state.hasOwnProperty(key))
  // console.log('auth/stateSet', key, val)
  // console.log('auth/state stateSet', state)
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
