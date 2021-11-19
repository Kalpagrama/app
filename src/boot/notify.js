import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

let notify = null
// TODO: max count on screen

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
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
    app.config.globalProperties.$notify = notify
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logE(err)
  }
})

export { notify }
