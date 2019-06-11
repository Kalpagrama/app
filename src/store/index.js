import Vue from 'vue'
import Vuex from 'vuex'
import ui from './ui'
import auth from './auth'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      auth,
      ui
    },
    strict: process.env.DEV,
  })

  return Store
}
