import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import cloneDeep from 'lodash/cloneDeep'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX_DBG)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX_DBG)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX_DBG)

export function addReactiveItem (state, { id, reactiveItem }) {
   if (process.env.NODE_ENV !== 'development') return
   state.allReactiveItems[id] = cloneDeep(reactiveItem)
}

export function addFindResult (state, { queryId, findResult }) {
   if (process.env.NODE_ENV !== 'development') return
   state.allFindResults[queryId] = cloneDeep(findResult)
}
