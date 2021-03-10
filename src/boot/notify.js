import { Notify } from 'quasar'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)

let notify = null
// TODO: max count on screen

export default async ({ Vue }) => {
  try {
    const f = {nameExtra: 'boot::notify'}
    logD(f, 'start')
    const t1 = performance.now()
    notify = (type, message = '', payload = {}) => {
      switch (type) {
        case 'info': {
          let options = {
            position: 'top',
            message: message,
            color: 'green',
            textColor: 'white',
            multiLine: false
          }
          Notify.create({...options, ...payload})
          break
        }
        case 'warn': {
          let options = {
            position: 'bottom',
            message: message,
            color: 'yellow',
            textColor: 'white',
            multiLine: false
          }
          Notify.create({...options, ...payload})
          break
        }
        case 'error': {
          let options = {
            position: 'bottom',
            message: message,
            color: 'red',
            textColor: 'white',
            multiLine: false
          }
          Notify.create({...options, ...payload})
          break
        }
      }
    }
    Vue.prototype.$notify = notify
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logE(err)
  }
}

export { notify }
