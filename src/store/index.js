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

// todo action currentUser instead of mutation!!!!
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
        let authInfo = await context.dispatch('auth/init')
        if (!authInfo.userIsConfirmed) return false
        let user = await context.dispatch('user/init')
        await context.dispatch('events/init')
        await context.dispatch('core/init')
        await context.dispatch('node/init')
        await context.dispatch('objects/init')
        await context.dispatch('workspace/init', user.wsRevision)
        await context.dispatch('lists/init')
        await context.dispatch('content/init')
        await i18next.changeLanguage(user.profile.lang)
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
