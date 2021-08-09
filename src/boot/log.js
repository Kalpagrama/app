// eslint-disable-next-line import/no-duplicates
import 'src/system/utils'
import { initLogger, performance } from 'src/system/log'

export default async ({ Vue, store, app, ssrContext }) => {
   try {
      let { logD, logI, logW, logE, logC } = await initLogger(store, ssrContext)
      const f = { nameExtra: 'boot::log' }
      logD(f, 'start')
      const t1 = performance.now()
      Vue.prototype.$log = Vue.prototype.$logD = logD
      Vue.prototype.$logI = logI
      Vue.prototype.$logW = logW
      Vue.prototype.$logE = logE
      Vue.prototype.$logC = logC
      Vue.config.errorHandler = function (err, vm, info) {
         // console.log('Vue.config.errorHandler')
         if (err) {
            if (err.processed) return
            err.processed = true
         }
         try {
            logE(err, info)
         } catch (e) {
            console.error(e, info)
         }
      }
      // в продакшене не работает
      Vue.config.warnHandler = function (msg, vm, trace) {
         // logW(`Vue.config.warnHandler: ${msg}\nTrace: ${trace}`)
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      console.error('error on boot::log', err)
   }
}
