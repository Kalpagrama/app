
export function init(state, userEvents) {
  state.userEvents = userEvents
  state.initialized = true
}

export function addEvent(state, userEvent) {
  state.userEvents.push(userEvent)
}

export function stateSet(state, [key, val]) {
  state[key] = val
}
