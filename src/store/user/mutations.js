import assert from 'assert'

export function init (state, currentUser) {
  assert.ok(currentUser)
  state.initialized = true
  state.user = currentUser
}
