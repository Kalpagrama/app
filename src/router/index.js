import Vue from 'vue'
import VueRouter from 'vue-router'
import assert from 'assert'
import routes from './routes'

const debug = require('debug')('[router]:index')
debug.enabled = true
Vue.use(VueRouter)

export default function (/* { store, ssrContext } */) {
  const router = new VueRouter({
    scrollBehavior (to, from, savedPosition) {
      // debug('sb', to, from)
      // console.log('scrollBehavior', to, from)
      if (savedPosition) {
        // console.log('### savedPosition', savedPosition)
        // alert('### savedPosition' + savedPosition.toString())
        // return savedPosition
        return {x: 0, y: 0}
      } else {
        // console.log('### no savedPosition!')
        // alert('### no savedPosition !!!')
        return {x: 0, y: 0}
      }
    },
    routes,
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  router.historyKalpa = [] // храним тут историю последних 100 переходов
  router.beforeEach((to, from, next) => {
    router.historyKalpa.push(to.path)
    if (router.historyKalpa.length > 100)router.historyKalpa.splice(0, router.historyKalpa.length - 100)
    next()
  })
  return router
}
