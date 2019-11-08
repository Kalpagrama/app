import Vue from 'vue'

export function init(state, user) {
  state.user = user
  state.initialized = true
}

export function stateSet(state, [key, val]) {
  // console.log('auth/stateSet', key, val)
  // console.log('auth/state stateSet', state)
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
