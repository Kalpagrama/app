import { boot } from 'quasar/wrappers'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import { rxdb } from 'src/system/rxdb'
import { systemReset } from 'src/system/services'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   try {
      const f = { nameExtra: 'boot::rxdb' }
      logD(f, 'start')
      const t1 = performance.now()
      await rxdb.create(store)
      app.config.globalProperties.$rxdb = rxdb
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      logE('cant create rxdb!', err)
      await systemReset(false)
      throw err // без rxdb работать не можем!
   }
})
