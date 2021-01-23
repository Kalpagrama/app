import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

import { initRxdb, rxdb } from 'src/system/rxdb'
import { systemReset } from 'src/system/services'

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    const f = {nameExtra: 'boot::rxdb'}
    logD(f, 'start')
    const t1 = performance.now()
    Vue.prototype.$rxdb = await initRxdb(store) // rxdbProxy
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logE('cant create rxdb!', err)
    await systemReset(false)
    throw err // без rxdb работать не можем!
  }
}
