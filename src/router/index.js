import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
const debug = require('debug')('[router]:index')
// debug.enabled = true
Vue.use(VueRouter)

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior (to, from, savedPosition) {
      debug('sb', to, from)
      debug('scrollBehavior', to, from)
      if (savedPosition) {
        debug('savedPosition', savedPosition)
        return savedPosition
      } else {
        debug('no savedPosition!')
        return {x: 0, y: 0}
      }
    },
    routes,
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  })

  return Router
}
