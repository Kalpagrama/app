import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.RXDB)

import { rxdb } from 'src/system/rxdb'
import { systemReset } from 'src/system/services'

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    await rxdb.create(store)
    Vue.prototype.$rxdb = rxdb // rxdbProxy
  } catch (err) {
    logE('cant create rxdb!', err)
    await systemReset(false)
    throw err // без rxdb работать не можем!
  }
}
