import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import core from './core'
import cache from './cache'
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
      cache,
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
        await context.dispatch('cache/init')
        await context.dispatch('auth/init')
        await context.dispatch('user/init')
        if (!context.state.auth.userIsConfirmed) return false
        await context.dispatch('events/init')
        await context.dispatch('core/init')
        await context.dispatch('node/init')
        await context.dispatch('objects/init')
        await context.dispatch('workspace/init')
        await context.dispatch('lists/init')
        await context.dispatch('content/init')
        let user = context.state.cache.cachedItems[context.state.auth.userOid]
        assert(user)
        await i18next.changeLanguage(user.profile.lang)
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
        // let xxx = await context.dispatch('lists/wsItems',
        //   { pagination: { pageSize: 30 }, sortStrategy: null, filter: { types: ['NODE', 'COMPOSITION', 'VIDEO'] } })
        logD('vuex init done!')
        return true
      }
    },
    getters: {
      currentUser: (state, getters, rootState, rootGetters) => {
        assert(state.auth.userOid, 'unknown user oid!')
        let user = state.cache.cachedItems[state.auth.userOid]
        assert(user, 'user not in cache!!!!')
        return user
      }
    }
  })

  return Store
}
