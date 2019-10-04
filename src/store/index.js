import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './workspace'
import node from './node'
import auth from './auth'
import ui from './ui'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      workspace,
      node,
      auth,
      ui
    },
    strict: process.env.DEV,
  })

  return Store
}
