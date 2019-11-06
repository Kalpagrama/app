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
import { apolloProvider } from 'boot/apollo'
import {objectShortFragment, eventFragment, userFragment, WSContentFragment, WSFragmentFragment, WSDraftFragment, WSBookmarkFragment, WSTagFragment} from 'schema/index'

Vue.use(Vuex)

async function init (context) {
  await context.dispatch('log/init')

  let { data: { user, categories, userWorkspace, userEvents, userSubscriptions } } = await apolloProvider.clients.apiApollo.query({
    query: gql`
      ${objectShortFragment} ${eventFragment} ${userFragment} ${WSContentFragment} ${WSFragmentFragment} ${WSBookmarkFragment} ${WSTagFragment} ${WSDraftFragment}
      query initializationQuery {
        user { ...userFragment}
        categories {
          type
          name
          icon
          sphere {
            oid
            type
            name
          }
        }
        userWorkspace {
          drafts { ...WSDraftFragment }
          fragments { ...WSFragmentFragment }
          contents { ...WSContentFragment }
          bookmarks { ...WSBookmarkFragment }
          tags { ...WSTagFragment }
        }
        userEvents{...eventFragment}
        userSubscriptions{...objectShortFragment}
      }`
  })
  // context.dispatch('log/debug', `initializationQuery complete. result= ${{ user, categories, userWorkspace, userEvents }}`, { root: true })
  await context.dispatch('auth/init', user)
  await context.dispatch('node/init', categories)
  await context.dispatch('workspace/init', userWorkspace)
  await context.dispatch('events/init', userEvents)
  await context.dispatch('subscriptions/init', userSubscriptions)
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
      subscriptions
    },
    strict: process.env.DEV,
    actions: {
      init: init
    }
  })

  return Store
}
