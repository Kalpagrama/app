import Vue from 'vue'

export function state(state, [key, val]) {
  if (val) {
    // Vue.set(state, key, val)
    state[key] = val
  } else {
    return state[key]
  }
}
