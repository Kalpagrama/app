import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import assert from 'assert'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.CP)

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
