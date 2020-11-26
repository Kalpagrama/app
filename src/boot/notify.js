import { Notify } from 'quasar'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)

let notify = null
// TODO: max count on screen

export default async ({ Vue }) => {
  try {
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
  } catch (err) {
    logE(err)
  }
}

export { notify }
