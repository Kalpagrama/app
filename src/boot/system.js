import { getLogFunc, isSsr, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SW)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.SW)

function t (str) {
  return str
}

let router

export default async ({ app, store, Vue, router: VueRouter }) => {
  try {
    // alert('SYSTEM router init')
    router = VueRouter
    if (isSsr) {
    } else {
      const {initApplication} = await import('src/system/services_browser')
      Vue.prototype.$systemUtils = await initApplication()
    }
  } catch (err) {
    logC(err)
    throw err // без initApplication работать не можем!
  }
}

export { t, router }
