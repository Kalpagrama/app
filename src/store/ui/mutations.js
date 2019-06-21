import Vue from 'vue'

export function state(state, [key, val]) {
  // console.log('ui/state', key, val)
  // console.log('ui/state state', state)
  if (val) {
    Vue.set(state, key, val)
    // state[key] = val
  } else {
    return state[key]
  }
}
