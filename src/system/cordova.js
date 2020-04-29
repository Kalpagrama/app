import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.CP)

async function cordovaInit () {
  // const capacitor = await import('../../src-capacitor/node_modules/@capacitor/core')
  // PushNotifications = capacitor.Plugins.PushNotifications
  // Share = capacitor.Plugins.Share
  // logD('PushNotifications=', PushNotifications)
  // logD('Share=', Share)

  // capacitorShowShareDialog().catch(err => logD('err on capacitor init', err))
}

export { cordovaInit }
