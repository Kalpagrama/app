import { boot } from 'quasar/wrappers'
// eslint-disable-next-line import/no-duplicates
import 'src/system/common/utils' // инициализация toJSON | String.in(...)
import { initLogger, performance, getLogFunc, LogLevelEnum, LogSystemModulesEnum, initLogRocket } from 'src/system/log'
// eslint-disable-next-line import/no-duplicates
import { assert } from 'src/system/common/utils'

function getLogFunctions(logSystemModulesEnum) {
  assert(Object.values(LogSystemModulesEnum).includes(logSystemModulesEnum))
  const logD = getLogFunc(LogLevelEnum.DEBUG, logSystemModulesEnum)
  const logT = getLogFunc(LogLevelEnum.TRACE, logSystemModulesEnum)
  const logI = getLogFunc(LogLevelEnum.INFO, logSystemModulesEnum)
  const logW = getLogFunc(LogLevelEnum.WARNING, logSystemModulesEnum)
  const logE = getLogFunc(LogLevelEnum.ERROR, logSystemModulesEnum)
  const logC = getLogFunc(LogLevelEnum.CRITICAL, logSystemModulesEnum)
  return { logD, logT, logI, logW, logE, logC }
}

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
  console.log('boot::logger::start')
  const { logD, logT, logI, logW, logE, logC } = await initLogger(store, ssrContext)
  const f = { nameExtra: 'boot::log' }
  logT(f, 'start')

  const t1 = performance.now()
  app.config.globalProperties.$log = app.config.globalProperties.$logD = logD
  app.config.globalProperties.$logT = logT
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
  logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
})

export { LogSystemModulesEnum, LogLevelEnum, getLogFunctions, performance, initLogRocket }
