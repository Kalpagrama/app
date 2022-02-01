import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum } from 'src/boot/log'
import { systemHardReset, systemReset } from 'src/system/services'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // всегда запускается первым boot-модулем
   logT('boot::start')
   // if (localStorage.getItem('k_rxdb_version') && parseInt(localStorage.getItem('k_rxdb_version')) < 2) {
   //    // alert('версия БД несовместима.')
   //    await systemHardReset()
   //    throw new Error('db incompatible!')
   // }
   // logT('boot::start localStorage=', localStorage)

   if (localStorage.getItem('k_launch_start')) {
      // предыдущий запуск был неудачным
      if (confirm('Штатная загрузка не удалась.\nОчистить данные и попытаться снова?')) {
         await systemHardReset()
         throw new Error('startup error!')
      }
   }
   // начата загрузка приложения (закончится когда все бут-модули отработают(end.js))
   localStorage.setItem('k_launch_start', 1)
})
