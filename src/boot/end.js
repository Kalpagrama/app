import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum } from 'src/boot/log'
import { systemHardReset, systemReset } from 'src/system/services'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // всегда запускается последним boot-модулем
   localStorage.removeItem('k_launch_start') // запустились!
})
