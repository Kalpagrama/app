import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import core from './core'
import node from './node'
import auth from './auth'
import ui from './ui'
import events from './events'
import objects from './objects'
import user from './user'
import lists from './lists'
import content from './content'
import i18next from 'i18next'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      workspace,
      core,
      node,
      auth,
      ui,
      events,
      objects,
      user,
      lists,
      content
    },
    strict: process.env.DEV,
    actions: {
      init: async (context) => {
        logD('vuex init')
        await context.dispatch('auth/init')
        if (!context.state.auth.userIsConfirmed) return false
        await context.dispatch('events/init')
        await context.dispatch('core/init')
        await context.dispatch('node/init')
        await context.dispatch('objects/init')
        await context.dispatch('user/init')
        await context.dispatch('workspace/init')
        await context.dispatch('lists/init')
        await context.dispatch('content/init')
        assert(context.state.objects.currentUser)
        await i18next.changeLanguage(context.state.objects.currentUser.profile.lang)
        // let val = 0.001
        // setTimeout(() => {
        //   setInterval(() => {
        //     val = val + 0.0001
        //     if (val >= 1) return
        //     context.commit('objects/update', {
        //       oid: 'An6e9mWDIH0=',
        //       path: 'rate',
        //       newValue: val
        //     }, { root: true })
        //   }, 10)
        // }, 2000)

        logD('vuex init done!')
        return true
      }
    },
    getters: {
      currentUser: (state, getters, rootState, rootGetters) => {
        assert(state.objects.currentUser)
        return state.objects.currentUser
      }
    }
  })

  return Store
}
