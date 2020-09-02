// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initServices } from 'src/system/services'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SW)

function t (str) {
  return str
}

export default async ({ app, store, Vue }) => {
  try {
    await initServices(store)
  } catch (err) {
    logE('error on system init', err)
  }
}

export { t }
