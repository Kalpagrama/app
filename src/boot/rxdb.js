import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { rxdb } from 'src/system/rxdb'
import { systemHardReset, systemReset } from 'src/system/services'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   try {
      const f = { nameExtra: 'boot::rxdb' }
      logT(f, 'start')
      const t1 = performance.now()
      try {
         await rxdb.create(store)
      } catch (err) { // такое может быть если например, обновилась схема данных...
         logE('err on rxdb create! try to systemHardReset', err)
         await systemHardReset()
      }
      app.config.globalProperties.$rxdb = rxdb
      logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      logC('cant boot::rxdb!', err)
      throw err // без rxdb работать не можем!
   }
})
