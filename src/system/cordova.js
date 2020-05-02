import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.CP)

async function initCordova (store) {
  assert(store)
  // const capacitor = await import('../../src-capacitor/node_modules/@capacitor/core')
  // PushNotifications = capacitor.Plugins.PushNotifications
  // Share = capacitor.Plugins.Share
  // logD('PushNotifications=', PushNotifications)
  // logD('Share=', Share)
}

// use cordova-plugin-firebase-messaging for FCM PUSH
async function initCordovaPushPlugin (store) {
  cordova.plugins.firebase.messaging.requestPermission({ forceShow: false }).then(function () {
    alert('Push messaging is allowed')
  })

  cordova.plugins.firebase.messaging.getToken().then(function (token) {
    alert('token====' + token)
  })
  cordova.plugins.firebase.messaging.onTokenRefresh(function() {
    alert('Device token updated')
  });

  cordova.plugins.firebase.messaging.onMessage(function (payload) {
    alert('New foreground FCM message:' + JSON.stringify(payload))
  })
  cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
    alert('New onBackgroundMessage FCM message:' + JSON.stringify(payload))
  })
}

export { initCordova, initCordovaPushPlugin }
