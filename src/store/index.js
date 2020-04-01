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
        // await context.dispatch('cache/init') cache инициализируется в boot модуле

        await context.dispatch('auth/init')
        let userIsConfirmed = context.state.auth.userIsConfirmed
        if (!userIsConfirmed) return false

        await context.dispatch('user/init')
        let user = context.getters.currentUser
        assert(user && context.state.auth.userIsConfirmed)

        await context.dispatch('events/init')
        await context.dispatch('core/init')
        await context.dispatch('node/init')
        await context.dispatch('objects/init')
        await context.dispatch('workspace/init', user.wsRevision)
        await context.dispatch('lists/init')
        await context.dispatch('content/init')
        await i18next.changeLanguage(user.profile.lang)
        logD('vuex init done!')
        // let chain = {
        //   spheres: [],
        //   links: [
        //     { leftOid: 'AwFnLYEBQAM', rightOid: 'AwFnz1MBQAU', type: 'ESSENCE' }
        //   ]
        // }
        // await context.dispatch('node/chainCreate', chain)
        // let res = await context.dispatch('lists/nodeChains', { nodeOid: 'AvxgHQuBQAM' })
        // logD('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', res)
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
