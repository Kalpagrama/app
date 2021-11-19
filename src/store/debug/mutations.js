import {assert} from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import cloneDeep from 'lodash/cloneDeep'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.VUEX_DBG)

function addReactiveItem (state, { id, reactiveItem }) {
   // if (process.env.NODE_ENV !== 'development') return
   // state.allReactiveItems[id] = cloneDeep(reactiveItem)
}

function addFindResult (state, { queryId, findResult }) {
   // const f = addFindResult
   // logD(f, 'start', queryId)
   // if (process.env.NODE_ENV !== 'development') return
   // state.allFindResults[queryId] = cloneDeep(findResult)
}

export default { addReactiveItem, addFindResult }
