import 'src/system/utils'
import { initLogger } from 'src/system/log'

export default async ({ Vue, store, app }) => {
   try {
      let { logD, logI, logW, logE, logC } = await initLogger(store)
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
   } catch (err) {
      console.error('error on boot::log', err)
   }
}
