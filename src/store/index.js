import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import core from './core'
import node from './node'
import auth from './auth'
import ui from './ui'
import events from './events'
import subscriptions from './subscriptions'
import objects from './objects'
import user from './user'
import { apolloProvider } from 'boot/apollo'
import { fragments } from 'schema/index'
import i18next from 'i18next'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)

Vue.use(Vuex)

async function init (context) {
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
            thumbUrl(preferWidth: 600)
          }
        }
      }`
  })
  // TODO make confortable
  if (!user.settings.notifications) {
    user.settings.notifications = {
      showInstantNotifications: true,
      enableSoundNotifications: true,
      eventFilter: [],
      emailNotificationFilter: true,
      pauseAllNotifications: true,
      assessmentsNotifications: true,
      subscriptionsNotifications: true,
      mentionsNotifications: true,
      sharedNotifications: true,
      nodeCreatedNotifications: true,
      nodeAddedNotifications: true
    }
  }
  await context.dispatch('core/init')
  await context.dispatch('auth/init')
  await context.dispatch('node/init', categories)
  await context.dispatch('objects/init', { user, fragmentName: 'userFragment' })
  await context.dispatch('workspace/init')
  await context.dispatch('events/init')
  await context.dispatch('subscriptions/init')
  await context.dispatch('user/init')
  await i18next.changeLanguage(user.profile.lang)

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  wait(1000).then(async () => {
    logD('test node cre')
    // await context.dispatch('workspace/wsNodeCreate', null)
    // await context.dispatch('node/nodeCreate', null)
    // await context.dispatch('workspace/wsSphereCreate', {
    //   name: 'test sphere2',
    // })

    // await context.dispatch('workspace/wsNodeCreate', {
    //   name: 'test node',
    //   categories: ['POLITICS'],
    //   spheres: [{ name: 'test sphere' }],
    //   fragments: [],
    //   meta: {
    //     layout: 'PIP',
    //     fragments: []
    //   }
    // })
  })
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
