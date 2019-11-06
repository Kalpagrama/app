
export const initialized = (state, getters) => {
  return state.initialized
}

export const userSubscriptions = (state, getters) => {
  return state.userSubscriptions
}

export function isSubscribed (state, oid) {
  return state.userSubscriptions.indexOf(oid) !== -1
}
