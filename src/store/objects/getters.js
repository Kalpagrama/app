export const initialized = (state, getters) => {
  return state.initialized
}
export const objectGet = (state) => ({ oid, fragmentName }) => {
  let storedValue = state.objects[oid]
  if (storedValue && storedValue.fragments.includes(fragmentName)) {
    return storedValue.objectData
  } else return null
}

// export const objectGet = (state, getters, rootState, rootGetters, params) => {
//   console.debug(params)
//   console.debug(params)
//   // let xxx = state.objects[oid]
//   // if (xxx) return xxx.objectData
// }
