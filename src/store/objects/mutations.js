import assert from 'assert'

export function init (state) {
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  // console.debug('asdasd')
  assert.ok(state.hasOwnProperty(key))
  state[key] = val
}

function cleanUp (state) {
  while (state.objectOids.length > 8888) {
    let first = state.objectOids.shift()
    delete state.objects[first]
  }
}

export function objectAdd (state, { object, fragmentName }) {
  assert.ok(object.oid)
  cleanUp(state)
  let storedValue = state.objects[object.oid]
  if (storedValue) {
    if (!storedValue.fragments.includes(fragmentName)) storedValue.fragments.push(fragmentName)
    for (let prop in object) {
      storedValue.objectData[prop] = object[prop]
    }
  } else {
    storedValue = state.objects[object.oid] = { objectData: object, fragments: [fragmentName] }
    state.objectOids.push(object.oid)
  }

  state.objects[object.oid] = storedValue
}
