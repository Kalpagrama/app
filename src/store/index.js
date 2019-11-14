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
import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'

Vue.use(Vuex)

async function init (context) {
  await context.dispatch('log/init')

  let { data: { user, categories, userWorkspace, userEvents, userSubscriptions } } = await apolloProvider.clients.apiApollo.query({
    query: gql`
      ${fragments.objectShortFragment} ${fragments.eventFragment} ${fragments.userFragment} ${fragments.WSContentFragment} ${fragments.WSFragmentFragment} ${fragments.WSBookmarkFragment} ${fragments.WSSphereFragment} ${fragments.WSNodeFragment}
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
          nodes { ...WSNodeFragment }
          fragments { ...WSFragmentFragment }
          contents { ...WSContentFragment }
          bookmarks { ...WSBookmarkFragment }
          spheres { ...WSSphereFragment }
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
  await context.dispatch('objects/init')
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
      objects
    },
    strict: process.env.DEV,
    actions: {
      init: init
    }
  })

  return Store
}
