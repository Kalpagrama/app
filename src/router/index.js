import Vue from 'vue'
import VueRouter from 'vue-router'
import {assert} from 'src/system/common/utils'
import routes from './routes'
import { getLogFunc, localStorage, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AuthApi } from 'src/api/auth'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.ROUTER)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.ROUTER)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.ROUTER)
Vue.use(VueRouter)

export default function (/* { store, ssrContext } */) {
  const router = new VueRouter({
    scrollBehavior (to, from, savedPosition) {
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
  router.beforeEach(async (to, from, next) => {
    router.historyKalpa.push(to.path)
    if (router.historyKalpa.length > 100)router.historyKalpa.splice(0, router.historyKalpa.length - 100)
    let redirectUrl
    if (to.query.originalUrl) { // способ миновать путь, когда nginx редиректит на бэкенд (ssr для роботов)
      console.log('redirect command received!', to.query.originalUrl)
      // sessionStorage.setItem('k_originalUrl', to.query.originalUrl)
      redirectUrl = to.query.originalUrl
    }
    if (to.query.masterToken) {
      console.log('clone session!', to.query.masterToken)
      if (localStorage.getItem('k_token') !== to.query.masterToken) { // userIdentify на сервере аннулирует текущую сессию
        await AuthApi.userIdentify(null, to.query.masterToken)
        await AuthApi.userAuthenticate(null)
      }
    }
    next(redirectUrl)
    // if (!AuthApi.userMatchMinimalRole(to.meta.roleMinimal || 'GUEST')) {
    //   alert('router::need more privileges')
    //   logD('router::need more privileges')
    //   return next('/auth') // если маршрут требует повышения - переходим на форму входа
    // } else {
    //   logD('router:: its ok! ')
    //   return next()
    // }
  })
  return router
}
