import Vue from 'vue'
import Vuex from 'vuex'
import ui from './ui'
import auth from './auth'
import workspace from './workspace'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      workspace,
      auth,
      ui
    },
    strict: process.env.DEV,
  })

  return Store
}
