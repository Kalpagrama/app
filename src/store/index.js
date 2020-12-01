import Vue from 'vue'
import Vuex from 'vuex'

import core from './core'
import ui from './ui'
import debug from './debug'
import {rxdb} from 'src/system/rxdb'
import assert from 'assert'
import {getLogFunc, LogLevelEnum, LogSystemModulesEnum} from 'src/system/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    core,
    ui,
    debug
  },
  strict: process.env.DEV,
  state: {},
  getters: {
    currentUser: (state, getters, rootState, rootGetters) => id => {
      assert(rxdb, '!rxdb')
      assert(rxdb.getCurrentUser, '!rxdb.getCurrentUser')
      assert(rxdb.getCurrentUser(), '!rxdb.getCurrentUser()')
      return rxdb.getCurrentUser()
    }
  }
})

// export default function (/* { ssrContext } */) {
//   logD('VUEX store create!!!')
//   const Store = new Vuex.Store({
//     modules: {
//       core,
//       ui,
//       debug
//     },
//     strict: process.env.DEV,
//     state: {},
//     actions: {
//       init: async (context, user) => {
//         // if (!localStorage.getItem('k_user_oid')) return false
//         // await rxdb.init(localStorage.getItem('k_user_oid'))
//         // currentUser = await rxdb.get(RxCollectionEnum.OBJ, localStorage.getItem('k_user_oid'))
//         // logD('currentUser', currentUser)
//         // assert(currentUser, '!currentUser')
//         // await context.dispatch('core/init')
//         // await i18next.changeLanguage(currentUser.profile.lang)
//         // // logD('vuex init done!')
//         // return true
//         currentUser = user
//         await context.dispatch('core/init')
//       }
//     },
//     getters: {
//       currentUser: (state, getters, rootState, rootGetters) => id => {
//         return currentUser
//       }
//     }
//   })
//
//   return Store
// }

export default store
