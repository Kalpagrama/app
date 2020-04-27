import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core'
const { PushNotifications, Share } = Plugins

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.CP)

// let PushNotifications, Share

async function capacitorInit () {
  // const capacitor = await import('../../src-capacitor/node_modules/@capacitor/core')
  // PushNotifications = capacitor.Plugins.PushNotifications
  // Share = capacitor.Plugins.Share
  // logD('PushNotifications=', PushNotifications)
  // logD('Share=', Share)

  // capacitorShowShareDialog().catch(err => logD('err on capacitor init', err))
  await capacitorWebPushInit()
}

async function capacitorWebPushInit () {
  assert(PushNotifications)
  // Request permission to use push notifications
  // iOS will prompt user and return if they granted permission or not
  // Android will just grant without prompting
  let result = await PushNotifications.requestPermission()
  if (result.granted) {
    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register()
  } else {
    logE('Push registration ERROR:', result)
  }

  // On success, we should be able to receive notifications
  PushNotifications.addListener('registration', (token) => {
      logD('Push registration success, token: ' + token.value)
    }
  )

  // Some issue with our setup and push will not work
  PushNotifications.addListener('registrationError', (error) => {
      logE('Error on push registration: ', error)
    }
  )

  // Show us the notification payload if the app is open on our device
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
      logD('Push received (app is opened): ', notification)
    }
  )

  // Method called when tapping on a notification
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      logD('Push action performed: ', notification)
    }
  )
}

async function capacitorShareInit () {
  assert(Share)
  let shareRet = await Share.addListener()
}

async function capacitorShowShareDialog () {
  assert(Share)
  let shareRet = await Share.share({
    title: 'title kalpagramma share data',
    text: 'text kalpagramma share data',
    url: 'https://kalpa.app/#OID',
    dialogTitle: 'dialogTitle kalpagramma share' // Android only
  })
}

export { capacitorInit }
