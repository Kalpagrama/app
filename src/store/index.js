import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import core from './core'
import ui from './ui'
import debug from './debug'
import { assert } from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { rxdb } from 'src/system/rxdb'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.VUEX)

let Store

export default store(function (/* { ssrContext } */) {
   Store = createStore({
      modules: {
         core,
         ui,
         debug
      },
      // enable strict mode (adds overhead!)
      // for dev mode and --debug builds only
      strict: process.env.DEBUGGING,
      state: {},
      mutations: {},
      getters: {
         currentUser: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser && rxdb.getCurrentUser())
            return rxdb.getCurrentUser()
         },
         isGuest: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser && rxdb.getCurrentUser())
            return rxdb.getCurrentUser() ? rxdb.getCurrentUser().profile.role === 'GUEST' : true
         },
         nodeCategories: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser && rxdb.getCurrentUser())
            assert(rxdb.getCurrentSettings && rxdb.getCurrentSettings())
            assert(rxdb.getCategoryOrder && rxdb.getCategoryOrder())
            // if (!currentUser || !currentSettings) return []
            // logT('nodeCategories', rxdb.getCategoryOrder(), rxdb.getCurrentSettings().nodeCategories)
            return rxdb.getCurrentSettings().nodeCategories
               .filter(c => c.lang === rxdb.getCurrentUser().profile.lang)
         },
         nodeCategoriesOrdered: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser && rxdb.getCurrentUser())
            assert(rxdb.getCurrentSettings && rxdb.getCurrentSettings())
            assert(rxdb.getCategoryOrder && rxdb.getCategoryOrder())
            // if (!currentUser || !currentSettings) return []
            // logT('nodeCategories', rxdb.getCategoryOrder(), rxdb.getCurrentSettings().nodeCategories)
            return rxdb.getCurrentSettings().nodeCategories
               .filter(c => c.lang === rxdb.getCurrentUser().profile.lang)
               .sort((left, right) => {
                  let leftSortedIndx = rxdb.getCategoryOrder().indexOf(left.type)
                  let rightSortedIndx = rxdb.getCategoryOrder().indexOf(right.type)
                  if (leftSortedIndx >= 0 && rightSortedIndx >= 0) return leftSortedIndx < rightSortedIndx ? -1 : 1
                  if (leftSortedIndx >= 0) return -1
                  if (rightSortedIndx >= 0) return 1
                  return -1
               })
         }
      }
   })
   return Store
})

export { Store as store }
