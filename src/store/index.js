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
import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/schema/index'
import i18next from 'i18next'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)

Vue.use(Vuex)

async function init (context) {
  logD('vuex init')
  await context.dispatch('auth/init')
  if (!context.state.auth.userIsConfirmed) return false
  await context.dispatch('events/init')
  let user = {}
  let categories = {}
  let promise = new Promise((resolve, reject) => {
    apollo.clients.api.watchQuery({
      query: gql`
        ${fragments.userFragment}
        query sw_network_first_initializationQuery {
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
        }`,
      fetchPolicy: 'cache-first'
    }).subscribe({
      next: ({ data }) => {
        logD('init vuex next data =', data)
        assert(data.user && data.categories)
        for (let prop in data.user) user[prop] = data.user[prop]
        for (let prop in data.categories) categories[prop] = data.categories[prop]
        resolve()
      },
      error: reject
    })
  })
  await promise
  // let {
  //   data: {
  //     user,
  //     categories,
  //   }
  // } = await apollo.clients.api.query({
  //   query: gql`
  //     ${fragments.userFragment}
  //     query sw_network_first_initializationQuery {
  //       user { ...userFragment}
  //       categories {
  //         type
  //         name
  //         alias
  //         icon
  //         sphere {
  //           oid
  //           type
  //           name
  //           thumbUrl(preferWidth: 600)
  //         }
  //       }
  //     }`,
  //   fetchPolicy: 'cache-first'
  // })
  // TODO remove
  // user.profile.tutorial = true
  // logD('user=', user)
  // logD('user.settings=', user.settings)
  // if (!user.settings.notifications) {
  //   user.settings.notifications = {
  //     showInstantNotifications: true,
  //     enableSoundNotifications: true,
  //     eventFilter: [],
  //     emailNotificationFilter: true,
  //     pauseAllNotifications: true,
  //     assessmentsNotifications: true,
  //     subscriptionsNotifications: true,
  //     mentionsNotifications: true,
  //     sharedNotifications: true,
  //     nodeCreatedNotifications: true,
  //     nodeAddedNotifications: true
  //   }
  // }
  await context.dispatch('core/init')
  await context.dispatch('node/init', categories)
  await context.dispatch('objects/init')
  await context.dispatch('user/init', user.oid)
  await context.dispatch('workspace/init')
  await context.dispatch('lists/init')
  await context.dispatch('content/init')
  context.commit('events/stateSet', ['userEvents', user.events], { root: true })
  await i18next.changeLanguage(user.profile.lang)

  // let timerId = setInterval(() => {
  //   let cacheData = context.getters['objects/get'](context.state.user.oid)
  //   logD('vuex init check user!', cacheData)
  // }, 50);

  logD('vuex init done!')
  return true
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
      objects,
      user,
      lists,
      content
    },
    strict: process.env.DEV,
    actions: {
      init: init
    },
    getters: {
      currUser: (state, getters, rootState, rootGetters) => {
        logD('currUser getter start, state=', state, rootState)
        let cacheData = rootGetters['objects/get'](rootState.user.oid)
        assert(cacheData)
        logD('currUser=', cacheData)
        return cacheData
      }
    }
  })

  return Store
}
