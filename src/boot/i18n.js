import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import VueI18Next from '@panter/vue-i18next'
import translations from '../i18n/index'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, document, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.BOOT)
let i18n

export default async ({ Vue, store, app }) => {
  try {
    const f = {nameExtra: 'boot::i18n'}
    logD(f, 'start')
    const t1 = performance.now()
    Vue.use(VueI18Next)
    const languageDetector = new LanguageDetector()
    await i18next
      .use(LanguageDetector)
      .init({
        saveMissing: true,
        fallbackLng: {
          'ru-RU': ['ru', 'en'],
          RUS: ['ru', 'en'],
          'en-US': ['en', 'ru'],
          ENG: ['en', 'ru'],
          default: ['en']
        },
        resources: {
          en: { translation: translations.en },
          ru: { translation: translations.ru }
        },
        detection: {
          // order and from where user language should be detected
          order: ['localStorage', 'querystring', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],

          // keys or params to lookup language from
          lookupQuerystring: 'lng',
          lookupCookie: 'i18next',
          lookupLocalStorage: 'i18nextLng',
          lookupFromPathIndex: 0,
          lookupFromSubdomainIndex: 0,

          // cache user language on
          caches: ['localStorage', 'cookie'],
          excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)

          // optional expire and domain for set cookie
          cookieMinutes: 10,
          cookieDomain: 'myDomain',

          // optional htmlTag with lang attribute, the default is:
          htmlTag: document.documentElement,

          // only detect languages that are in the whitelist
          checkWhitelist: true
        }
      })
    // console.debug('asdasdasd')
    app.i18n = i18n = new VueI18Next(i18next)

    // t = i18next.t
    // Vue.prototype.$t = t
    i18next.on('missingKey', function (lngs, namespace, key, res) {
      // logE('translate is missing', lngs, namespace, key, res)
    })
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logE(err)
  }
}

export { i18n }
