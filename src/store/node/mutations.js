
export function init(state, categories) {
  state.categories = categories
  state.initialized = true
}

export function state(state, [key, val]) {
  state[key] = val
}
