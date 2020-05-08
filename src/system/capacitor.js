import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'
import { notify } from 'src/boot/notify'
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core'

const { PushNotifications, Share, App } = Plugins

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.CP)

// let PushNotifications, Share

async function initCapacitor (store) {
  // share для ios (не разобрался как из ios послать эвент в js без плагина)
  App.addListener('appUrlOpen', (openData) => {
    let url = new URL(openData.url)
    let data = url.searchParams.get('data')
    let text = url.searchParams.get('contentText')
    alert(data)
    alert(text)
  })
  // share для android
  window.addEventListener('shareEventKalpa', (e) => {
    // Prevent the mini-info bar from appearing.
    alert('shareEventKalpa !!!!!!!!!!!!!!!!!!!!!' + JSON.stringify(e))
  })
}

async function initCapacitorPushPlugin (store) {
  assert(PushNotifications)
  // Request permission to use push notifications
  // iOS will prompt user and return if they granted permission or not
  // Android will just grant without prompting
  let result = await PushNotifications.requestPermission()
  if (result.granted) {
    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register()
  } else {
    alert('Push registration ERROR:')
    logE('Push registration ERROR:', result)
  }

  // On success, we should be able to receive notifications
  PushNotifications.addListener('registration', (token) => {
      alert('Push registration success, token: ' + token.value)
      logD('Push registration success, token: ' + token.value)
      store.dispatch('core/setWebPushToken', token.value)
    }
  )

  // Some issue with our setup and push will not work
  PushNotifications.addListener('registrationError', (error) => {
      alert('Error on push registration:')
      logE('Error on push registration: ', error)
    }
  )

  // Show us the notification payload if the app is open on our device
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
      alert('Push received (app is opened):' + JSON.stringify(notification))
      logD('Push received (app is opened): ', notification)
    }
  )

  // Method called when tapping on a notification
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      alert('Push action performed:' + JSON.stringify(notification))
      logD('Push action performed: ', notification)
    }
  )
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

export { initCapacitor, initCapacitorPushPlugin }
