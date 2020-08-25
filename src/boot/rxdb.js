import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.RXDB)

import { rxdb } from 'src/system/rxdb'

export default async ({ Vue, store, router: VueRouter }) => {
  try {
    await rxdb.create(store)
    Vue.prototype.$rxdb = rxdb // rxdbProxy
  } catch (err) {
    logE(err)
  }
}
