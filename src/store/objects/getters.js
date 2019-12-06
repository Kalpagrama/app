
export const queryInProgress = (state, getters) => {
  return state.queryInProgress
}

export const objectGet = (state) => ({ oid, fragmentName }) => {
  let storedValue = state.objects[oid]
  if (storedValue && (!fragmentName || storedValue.fragments.includes(fragmentName))) {
    return storedValue.objectData
  } else return null
}
