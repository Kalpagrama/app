export const initialized = (state, getters) => {
  return state.initialized
}
export const queryInProgress = (state, getters) => {
  return state.queryInProgress
}

export const objectGet = (state) => ({ oid, fragmentName }) => {
  let storedValue = state.objects[oid]
  if (storedValue && storedValue.fragments.includes(fragmentName)) {
    return storedValue.objectData
  } else return null
}
