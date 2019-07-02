import Vue from 'vue'
import Vuex from 'vuex'
import ui from './ui'
import auth from './auth'
import feed from './feed'

Vue.use(Vuex)

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      feed,
      auth,
      ui
    },
    strict: process.env.DEV,
  })

  return Store
}
