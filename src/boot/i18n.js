import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

let i18n
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

let setLocale, t

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   // https://vue-i18n.intlify.dev/guide/
   // https://github.com/intlify/vue-i18n-next
   i18n = createI18n({
      locale: navigator.language,
      formatFallbackMessages: true,
      fallbackLocale: {
         'ru-RU': ['ru', 'en'],
         RUS: ['ru', 'en'],
         'en-US': ['en', 'ru'],
         ENG: ['en', 'ru'],
         default: ['en']
      },
      messages
   })
   setLocale = locale => {
      i18n.global.locale = locale
   }
   t = i18n.global.t
   // Set i18n instance on app
   app.use(i18n)
})

export { setLocale, t }
