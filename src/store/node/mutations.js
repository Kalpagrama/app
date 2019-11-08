
export function init(state, categories) {
  state.categories = categories
  state.initialized = true
}

export function stateSet(state, [key, val]) {
  state[key] = val
}
