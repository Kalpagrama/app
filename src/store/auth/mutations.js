import Vue from 'vue'

export function state(state, [key, val]) {
  // console.log('auth/state', key, val)
  // console.log('auth/state state', state)
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
