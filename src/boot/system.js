// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initServices } from 'src/system/services'
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
    await initServices(store)
  } catch (err) {
    logC(err)
    throw err // без initServices работать не можем!
  }
}

export { t, router }
