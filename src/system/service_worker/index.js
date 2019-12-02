// Внимание! firebase подключается через CDN  в src/system/service_worker/service-worker.js
import * as firebase from 'firebase/app'
import '@firebase/messaging'
import { logD, logW } from 'src/boot/log'

let registration = null // ServiceWorkerRegistration
let messaging = null

async function initSw (store) {
  logD('initSw')
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-info bar from appearing.
    logD('beforeinstallprompt')
    // e.preventDefault()
    store.commit('core/stateSet', ['installPrompt', e])
  })
  window.addEventListener('appinstalled', (e) => {
    // Prevent the mini-info bar from appearing.
    logD('appinstalled')
    // e.preventDefault()
    store.commit('core/stateSet', ['installPrompt', null])
  })
  if ('serviceWorker' in navigator && !registration) {
    registration = await navigator.serviceWorker.register('/service-worker.js')
    registration.addEventListener('updatefound', function() {
      // If updatefound is fired, it means that there's
      // a new service worker being installed.
      // let installingWorker = registration.installing;
      // logW('V1 initSw onupdatefound2:', installingWorker)
      store.commit('core/stateSet', ['newVersionAvailable', true])
    })
    await initWebPush(store)
  }
}

async function initWebPush (store) {
  if ('safari' in window && 'pushNotification' in window.safari) { // APNS
    // let permissionData = window.safari.pushNotification.permission('mac.kalpagramma.com')
    // checkSafariRemotePermission(permissionData, store)
  } else { // FCM
    const hasPerm = await askForNPerm()
    if (!hasPerm) {
      logD('Notification permission denied!')
      return
    }
    if (firebase.messaging.isSupported() && registration && !messaging) {
      firebase.initializeApp({
        apiKey: 'AIzaSyAznncIqhrqA35A3yBQkTnxyNGI45sxeNk',
        authDomain: 'kalpagramma-7a913.firebaseapp.com',
        databaseURL: 'https://kalpagramma-7a913.firebaseio.com',
        projectId: 'kalpagramma-7a913',
        storageBucket: 'kalpagramma-7a913.appspot.com',
        messagingSenderId: '1082935232322',
        appId: '1:1082935232322:web:a4f0203aa4015e8f86eadb',
        measurementId: 'G-D8QZ67XLM5'
      })
      messaging = firebase.messaging()
      messaging.useServiceWorker(registration)
      // - a message is received while the app has focus
      messaging.onMessage((payload) => {
        logD('Message received . ', payload)
        // ...
      })

      let token = await messaging.getToken()
      store.commit('core/stateSet', ['webPushTokenDraft', token])

      logD(token)
      showNotification('initWebPush ok', 'body')
      // todo send to server
      messaging.onTokenRefresh(async () => {
        let token = await messaging.getToken()
        await store.dispatch('core/setWebPushToken', token)
      })
      return token
    }
  }
}

async function checkUpdate () {
  logD('checkUpdate1')
  if (registration) {
    logD('checkUpdate2')
    await registration.update()
  }
}

async function askForNPerm () {
  return new Promise((resolve, reject) => {
    if (!('Notification' in window)) {
      logD('This browser does not support desktop notification')
      return resolve(false)
    }
    if (Notification.permission === 'granted') return resolve(true)

    Notification.requestPermission(function (result) {
      logD('User choice', result)
      if (result !== 'granted') {
        logD('No notification permission granted!')
        return resolve(false)
      } else {
        return resolve(true)
      }
    })
  })
}

function checkSafariRemotePermission (permissionData, vuexContext) {
  if (permissionData.permission === 'default') {
    // This is a new web service URL and its validity is unknown.
    window.safari.pushNotification.requestPermission(
      'https://domain.example.com', // The web service URL.
      'web.com.example.domain', // The Website Push ID.
      {}, // Data that you choose to send to your server to help you identify the user.
      checkSafariRemotePermission // The callback function
    )
  } else if (permissionData.permission === 'denied') {
    // The user said no.
  } else if (permissionData.permission === 'granted') {
    // The web service URL is a valid push provider, and the user said yes.
    // permissionData.deviceToken is now available to use.
    vuexContext.dispatch('core/setWebPushToken', permissionData.deviceToken).catch(err => {
      console.error('err on save in vuex:', err)
    })
  }
}

async function showNotification (title, body) {
  let options = {
    body: body,
    icon: '/statics/icons/icon-192x192.png',
    badge: '/statics/icons/badge3.png',
    vibrate: [150, 200, 150, 200, 150, 100, 150, 100],
    tag: 'tag: sample'
  }
  let notification = new Notification('direct:' + title, options)
  logD('notification=', notification)

  if (registration) {
    // todo
    if ('actions' in Notification.prototype) {
      // Action buttons are supported.
      options.actions = [
        {
          action: 'test',
          title: 'action-test',
          icon: '/statics/icons/favicon-32x32.png'
        }
      ]
    } else {
      // Action buttons are NOT supported.
    }
    registration.showNotification(title, options)
  }
}

export { initSw, initWebPush, checkUpdate }
