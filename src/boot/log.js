import { boot } from 'quasar/wrappers'
import 'src/system/common/utils' // инициализация toJSON | String.in(...)
import { initLogger, performance } from 'src/system/log'

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
  const { logD, logI, logW, logE, logC } = await initLogger(store, ssrContext)
  const f = { nameExtra: 'boot::log' }
  logD(f, 'start')

  const t1 = performance.now()
  app.config.globalProperties.$log = app.config.globalProperties.$logD = logD
  app.config.globalProperties.$logI = logI
  app.config.globalProperties.$logW = logW
  app.config.globalProperties.$logE = logE
  app.config.globalProperties.$logC = logC
  app.config.errorHandler = function (err, vm, info) {
    // console.log('Vue.config.errorHandler')
    if (err) {
      if (err.processed) return
      err.processed = true
    }
    try {
      logE(err, info)
    } catch (e) {
      console.error(e, info)
    }
  }
  // в продакшене не работает
  app.config.warnHandler = function (msg, vm, trace) {
    // logW(`Vue.config.warnHandler: ${msg}\nTrace: ${trace}`)
  }
  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
})
