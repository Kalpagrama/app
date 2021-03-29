import { getLogFunc, isSsr, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { systemInit } from 'src/system/services'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

function t (str) {
  return str
}

let router

export default async ({ app, store, Vue, router: VueRouter }) => {
  try {
    const f = {nameExtra: 'boot::system'}
    logD(f, 'start')
    const t1 = performance.now()
    router = VueRouter
    if (isSsr) {
    } else {
      const {initApplication} = await import('src/system/services_browser')
      Vue.prototype.$systemUtils = await initApplication()
      logD(f, 'try systemInit...')
      await systemInit() // для гостей тоже надо входить (если уже войдено - ничего не сделает)
      logD(f, 'systemInit OK')
    }
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err // без initApplication работать не можем!
  }
}

export { t, router }
