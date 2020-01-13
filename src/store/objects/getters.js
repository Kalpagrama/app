import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const queryInProgress = (state, getters) => {
  return state.queryInProgress
}

// export const objectGet = (state) => ({ oid, fragmentName }) => {
//   let storedValue = state.objects[oid]
//   if (storedValue && (!fragmentName || storedValue.fragments.includes(fragmentName))) {
//     return storedValue.objectData
//   } else {
//     return null
//   }
// }

export const get = (state) => (oid) => {
  logD('object getter ', oid)
  let cacheData = apollo.clients.api.readFragment({
    id: oid,
    fragmentName: 'objectFullFragment',
    fragment: fragments.objectFullFragment
  })
  logD('object getter ', oid, cacheData)
  return cacheData
}
