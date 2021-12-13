import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum } from 'src/boot/log'
import { systemHardReset, systemReset } from 'src/system/services'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // всегда запускается первым boot-модулем
   if (localStorage.getItem('k_launch_start')) {
      alert('Приложению не удалось штатно запуститься. Пытаемся очисить старые данные и запуститься...')
      await systemHardReset() // предыдущий запуск был неудачным
   }
   localStorage.setItem('k_launch_start', 1)
})
