import { boot } from 'quasar/wrappers'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { systemInit } from 'src/system/services'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

function t (str) {
  return str
}

let router

export default boot(async ({ app, router: VueRouter, store, ssrContext, urlPath, publicPath, redirect }) => {
  try {
    const f = {nameExtra: 'boot::system'}
    logD(f, 'start')
    const t1 = performance.now()
    router = VueRouter
    const {initApplication} = await import('src/system/services')
    app.config.globalProperties.$systemUtils = await initApplication()
    await systemInit() // для гостей тоже надо входить (если уже войдено - ничего не сделает)
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err // без initApplication работать не можем!
  }
})

export { t, router }
