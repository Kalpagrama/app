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
      if (!localStorage.getItem('TMP_NEW_VERSION_LOKI')) {
         await systemHardReset(false)
         localStorage.setItem('TMP_NEW_VERSION_LOKI', 'INSTALLED')
         window.location.reload()
         return
      }
      await rxdb.create(store)
      app.config.globalProperties.$rxdb = rxdb
      logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      console.error('cant create rxdb!', err)
      logE('cant create rxdb!', err)
      await systemReset(false)
      throw err // без rxdb работать не можем!
   }
})
