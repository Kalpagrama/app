import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

let i18n
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { LangEnum } from 'src/system/common/enums'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

let setLocale, getLocale, t

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   const f = { nameExtra: 'boot::i18n' }
   logD(f, 'start')
   // alert('navigator.language=' + navigator.language)
   const t1 = performance.now()
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
   i18n.global.locale = LangEnum.RUS // navigator.language на мобильниках не работает корректно (всегда английский)
   setLocale = locale => {
      // const f = { nameExtra: 'boot::setLocale' }
      // logW(f, 'locale=', locale)
      i18n.global.locale = locale || navigator.language
   }
   getLocale = () => {
      return i18n.global.locale.in('ru-RU', 'RUS') ? LangEnum.RUS : LangEnum.ENG
   }
   t = i18n.global.t
   // Set i18n instance on app
   app.use(i18n)
   logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
})

export { setLocale, getLocale, t }
