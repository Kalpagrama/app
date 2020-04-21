import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core'
import { Platform } from 'quasar'

const { PushNotifications, Share } = Plugins

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.CP)

let shareRet = Share.addListener('qwerty', () => {
  alert('share menu!!!')
})

async function capacitorWebPushInit () {
  alert('----Platform.is=' + JSON.stringify(Platform.is))

  await capacitorShowShareDialog()

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
  let shareRet = await Share.addListener()
}

async function capacitorShowShareDialog () {
  let shareRet = await Share.share({
    title: 'title kalpagramma share data',
    text: 'text kalpagramma share data',
    url: 'https://kalpa.app/#OID',
    dialogTitle: 'dialogTitle kalpagramma share' // Android only
  })
}

export { capacitorWebPushInit }
