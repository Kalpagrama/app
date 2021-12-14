import { boot } from 'quasar/wrappers'
// import VueYandexMetrika from 'vue-yandex-metrika'
import { getLogFunctions, LogSystemModulesEnum } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // logT('yandex-metrika', 'start')
   // app.use(VueYandexMetrika, {
   //    id: 60818698,
   //    // router: router,
   //    // env: process.env.NODE_ENV,
   //    clickmap: true,
   //    trackLinks: true,
   //    accurateTrackBounce: true,
   //    webvisor: window.location.href.includes('local') ? false : true
   //    // other options
   // })
   // logT('yandex-metrika', 'complete')
})
