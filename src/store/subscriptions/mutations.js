import assert from 'assert'
import { logD } from 'boot/log'
export function init (state, userSubscriptions) {
  state.userSubscriptions = userSubscriptions
  state.initialized = true
}

export function stateSet (state, [key, val]) {
  assert.ok(Object.prototype.hasOwnProperty.call(state, key))
  state[key] = val
}

export function subscribe (state, objectShort) {
  assert.ok(state.userSubscriptions.indexOf(objectShort.oid) === -1)
  state.userSubscriptions.push(objectShort)
  logD('subscrbe')
}

export function unSubscribe (state, objectShort) {
  let index = state.userSubscriptions.findIndex(s => s.oid === objectShort.oid)
  assert.ok(index >= 0)
  state.userSubscriptions.splice(index, 1)
  logD('unSubscrbe')
}
