import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import core from './core'
import node from './node'
import auth from './auth'
import ui from './ui'
import events from './events'
import log from './log'
import subscriptions from './subscriptions'
import objects from './objects'
import user from './user'
import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import { initSw, initWebPush } from 'src/system/service_worker'
import i18next from 'i18next'

Vue.use(Vuex)

async function init (context) {
  await context.dispatch('log/init')

  let { data: { user, categories, userWorkspace, userEvents, userSubscriptions, userSettings } } = await apolloProvider.clients.apiApollo.query({
    query: gql`
      ${fragments.userFragment}
      query initializationQuery {
        user { ...userFragment}
        categories {
          type
          name
          alias
          icon
          sphere {
            oid
            type
            name
          }
        }
      }`
  })
  // todo убрать юзера из auth
  await context.dispatch('core/init')
  await context.dispatch('auth/init', user)
  await context.dispatch('node/init', categories)
  await context.dispatch('workspace/init', user.workspace)
  await context.dispatch('events/init', user.events)
  await context.dispatch('subscriptions/init', user.subscriptions)
  await context.dispatch('objects/init')
  await context.dispatch('user/init', user)
  await i18next.changeLanguage(user.profile.lang);
}

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      workspace,
      core,
      node,
      auth,
      ui,
      events,
      log,
      subscriptions,
      objects,
      user
    },
    strict: process.env.DEV,
    actions: {
      init: init
    }
  })

  return Store
}
