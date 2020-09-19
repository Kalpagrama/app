import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB)

import { rxdb } from 'src/system/rxdb'
import { systemHardReset } from 'src/system/services'

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    await rxdb.create(store)
    Vue.prototype.$rxdb = rxdb // rxdbProxy
  } catch (err) {
    logE(err)
    let hardReset = confirm('critical error on startup: ' + JSON.stringify(err) + '\n\nMake hardReset?')
    if (hardReset) {
      const { systemHardReset } = require('src/system/services')
      await systemHardReset()
      window.location.reload()
    }
    throw err // без rxdb работать не можем!
  }
}
