import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.RXDB)

import { rxdb } from 'src/system/rxdb'

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    await rxdb.init(store)
    Vue.prototype.$rxdb = rxdb // rxdbProxy
  } catch (err) {
    logE(err)
  }
}
