// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initSw } from 'src/system/service_worker'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.SW)

function t (str) {
  return str
}

export default async ({ app, store, Vue }) => {
  try {
    await initSw(store)
  } catch (err) {
    logE(err)
  }
}

export { t }
