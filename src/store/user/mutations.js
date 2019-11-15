import assert from 'assert'

export function init (state, user) {
  state.user = user
  state.initialized = true
}

function setObjectValue(state, object, path, value){
  let propValue = object
  for (let i = 0; i < path.length; i++) {
    let propName = path[i]
    propValue = propValue[propName]
    assert.ok(propValue)
    if (i === path.length - 1) propValue[propName] = value
  }
}

export const setSettingValue = async (state, path, value) => {
  setObjectValue(state, state.user.settings, path, value)
}

export const setProfileValue = async (state, path, value) => {
  setObjectValue(state, state.user.profile, path, value)
}
