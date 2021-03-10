import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)

export default async ({ Vue }) => {
  try {
    const f = {nameExtra: 'boot::filters'}
    logD(f, 'start')
    const t1 = performance.now()
    Vue.filter('rate', (value) => {
      if (value <= 0.2) return 'Нет'
      if (value <= 0.4) return 'Скорее нет'
      if (value <= 0.6) return 'Может быть'
      if (value <= 0.8) return 'Скорее да'
      return 'Да'
    })
    Vue.filter('cut', function (text, length) {
      let add = text.length > length ? '...' : ''
      return text.slice(0, length) + add
    })
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logE(err)
  }
}
