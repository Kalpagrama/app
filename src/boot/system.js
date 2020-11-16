// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initApplication } from 'src/system/services'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
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
    Vue.prototype.$systemUtils = await initApplication()
    // await initApplication()
  } catch (err) {
    logC(err)
    throw err // без initApplication работать не можем!
  }
}

export { t, router }
