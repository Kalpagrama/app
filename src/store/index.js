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
            assert(rxdb.getCurrentUser())
            return rxdb.getCurrentUser()
         },
         isGuest: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser())
            return rxdb.getCurrentUser() ? rxdb.getCurrentUser().profile.role === 'GUEST' : true
         },
         nodeCategories: (state, getters, rootState, rootGetters) => {
            assert(rxdb.getCurrentUser())
            assert(rxdb.getCurrentSettings())
            // if (!currentUser || !currentSettings) return []
            return rxdb.getCurrentSettings().nodeCategories.filter(c => c.lang === rxdb.getCurrentUser().profile.lang)
         }
      }
   })
   return Store
})

export { Store as store }
