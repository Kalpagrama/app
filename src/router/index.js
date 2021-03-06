import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'

import {assert} from 'src/system/common/utils'
import routes from './routes'
import { t } from 'src/boot/i18n'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { AuthApi } from 'src/api/auth'
import { rxdb } from 'src/system/rxdb'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.ROUTER)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ app, store, ssrContext, urlPath, publicPath, redirect }) {
  // alert('process.env.VUE_ROUTER_MODE:' + process.env.VUE_ROUTER_MODE)
  const createHistory = process.env.SERVER
     ? createMemoryHistory
     : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)
  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? undefined : process.env.VUE_ROUTER_BASE)
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
      if (rxdb.getAuthToken() !== to.query.masterToken) { // userIdentify на сервере аннулирует текущую сессию
        await AuthApi.userIdentify(null, to.query.masterToken)
        await AuthApi.userAuthenticate(null)
      }
    }
    if (redirectUrl) return next(redirectUrl)
    if (!AuthApi.userMatchMinimalRole(to.meta.roleMinimal || 'GUEST')) {
      logD('router::need more privileges')
      store.commit('ui/stateSet', ['authGuard', { message: t('Для перехода на эту страницу нужно войти...') }])
    }
    return next()
  })
  return router
})
