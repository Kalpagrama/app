import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum } from 'src/boot/log'
import { systemHardReset, systemReset } from 'src/system/services'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // всегда запускается первым boot-модулем
   logT('boot::start')
   if (localStorage.getItem('k_rxdb_create_date')) {
      // alert('версия БД несовместима.')
      await systemHardReset()
      throw new Error('db incompatible!')
   }
   logT('boot::start localStorage=', localStorage)

   if (localStorage.getItem('k_launch_start')) {
      alert('Штатная загрузка не удалась.\nПытаемся очистить старые данные...')
      await systemHardReset() // предыдущий запуск был неудачным
      throw new Error('startup error!')
   }
   localStorage.setItem('k_launch_start', 1)
})
