import assert from 'assert'

export function init (state, settings) {
  state.settings = settings
  state.initialized = true
}
