
export function init(state, userEvents) {
  state.userEvents = userEvents
  state.initialized = true
}

export function state(state, [key, val]) {
  state[key] = val
}
