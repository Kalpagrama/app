import Vue from 'vue'
import Vuex from 'vuex'

import core from './core'
import ui from './ui'
import i18next from 'i18next'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)

Vue.use(Vuex)

var currentUser = null

// todo action currentUser instead of mutation!!!!
export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      core,
      ui
    },
    strict: process.env.DEV,
    state: {
    },
    actions: {
      init: async (context) => {
        // await context.dispatch('auth/init')
        // let userIsConfirmed = context.state.auth.userIsConfirmed
        // if (!userIsConfirmed) return false
        // await context.dispatch('user/init')
        // // let user = context.getters.currentUser
        // logD('user = ', user, context.state.auth)
        // assert(user && context.state.auth.userIsConfirmed, 'user && context.state.auth.userIsConfirmed')
        if (!localStorage.getItem('k_user_oid')) return false
        logD('before rxdb.init')
        await rxdb.startBackgroundProcesses(localStorage.getItem('k_user_oid'))
        currentUser = await rxdb.get(RxCollectionEnum.OBJ, localStorage.getItem('k_user_oid'))
        logD('currentUser', currentUser)
        assert(currentUser, '!currentUser')
        logD('after rxdb.init')

        await context.dispatch('core/init')
        await i18next.changeLanguage(currentUser.profile.lang)
        // logD('vuex init done!')
        return true
      }
    },
    getters: {
      currentUser: (state, getters, rootState, rootGetters) => id => {
        return currentUser
      }
    }
  })

  return Store
}
