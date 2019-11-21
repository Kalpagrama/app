import assert from 'assert'

export function init (state, user) {
  state.user = user
  state.initialized = true
}

export function setUserValue(state, {path, value}) {
  let propValue = state.user
  for (let i = 0; i < path.length; i++) {
    let propName = path[i]
    propValue = propValue[propName]
    assert.ok(propValue)
    if (i === path.length - 1) propValue[propName] = value
  }
}
