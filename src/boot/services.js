// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initServices } from 'src/system/services'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.SW)

function t (str) {
  return str
}

export default async ({ app, store, Vue }) => {
  try {
    await initServices(store)
  } catch (err) {
    logE('error on init serviceworker', err)
  }
}

export { t }
