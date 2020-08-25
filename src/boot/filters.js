import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)

export default async ({ Vue }) => {
  try {
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
  } catch (err) {
    logE(err)
  }
}
