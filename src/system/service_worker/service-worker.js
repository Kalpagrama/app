/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })
function logFunc(...msg){
  console.log('sw_message:', ...msg)
  Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
}
function errFunc(...msg){
  console.error(...msg)
  Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
}

const swVer = 28
logFunc('SW_VER=', swVer)

/* global workbox */
workbox.core.setCacheNameDetails({ prefix: 'app' })
workbox.core.skipWaiting()
workbox.core.clientsClaim()

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

self.addEventListener('message', function handler (event) {
  logFunc('V1 message!', event)
  var promise = self.clients.matchAll()
    .then(function (clientList) {
      logFunc('V1 message! clientList', clientList)
      var senderID = event.source.id

      clientList.forEach(function (client) {
        logFunc('V1 message! postMessage', client)
        client.postMessage({
          client: senderID,
          message: event.data,
          self
        })
      })
    })
  if (event.waitUntil) {
    event.waitUntil(promise)
  }
})
self.addEventListener('install', event => {
  logFunc('V1 now ready to install!', swVer)
})
self.addEventListener('activate', event => {
  logFunc('V1 now ready to handle activate!', swVer)
})
self.addEventListener('fetch', event => {
  logFunc('V1 now ready to handle fetches!', swVer)
})
self.addEventListener('updatefound', event => {
  logFunc('V1 now ready to update!', swVer)
})
self.addEventListener('error', function(e) {
  errFunc(e.filename, e.lineno, e.colno, e.message)
});
// ----------------------- settings for Web-push------------------------------

/* global importScripts */
importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.5.0/firebase-messaging.js')

/* global firebase */
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
//
let i = 0
if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging()
  messaging.setBackgroundMessageHandler(function (payload) {
    logFunc('[firebase-messaging-sw.js] Received background message ', payload)

    // Customize notification here
    const notificationTitle = `#${++i} ${payload.data.type} event received!`
    const notificationOptions = {
      body: `payload: ${JSON.stringify(payload.data.type)}`,
      icon: '/statics/icons/icon-192x192.png',
      badge: '/statics/icons/badge3.png',
      vibrate: [150, 200, 150, 200, 150, 100, 150, 100],
      tag: `tag: sample ${i}`,
      actions: [
        {
          action: 'test',
          title: 'action-test',
          icon: '/statics/kalpagramma-logo.png'
        }
      ]
    }
    return self.registration.showNotification(notificationTitle, notificationOptions)

  //   const notificationOptions = {
  //     body: 'Background Message body.',
  //     icon: '/firebase-logo.png'
  //   }
  //   return self.registration.showNotification(notificationTitle,
  //     notificationOptions);
  })
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  if (event.action === 'test') {
    logFunc('test action was clicked')
    self.clients.openWindow('/app/trends/SCIENCE?sort=HOT')
  } else {
    // Main body of notification was clicked
    self.clients.openWindow('/app')
  }
}, false)
