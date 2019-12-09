const swVer = 3z
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

let logModulesBlackList = []
let logLevel = 0
let logLevelSentry = 3
importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })

function logFunc (...msg) {
  if (logModulesBlackList.includes('sw')) return
  if (logLevel <= 2) console.log('SW: ', swVer, ...msg)
  if (logLevelSentry <= 2) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
}
function errCritFunc (...msg) {
  if (logLevel <= 4) console.error(...msg)
  if (logLevelSentry <= 4) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
}

logFunc('SW_VER=', swVer)

/* global workbox */
workbox.core.setCacheNameDetails({ prefix: 'app' })
workbox.core.skipWaiting()
workbox.core.clientsClaim()

// порядок вызовов precacheAndRoute и registerRoute имеет значение
// precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
logFunc('self.__precacheManifest=', self.__precacheManifest)

workbox.routing.registerRoute(
  /\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'sameOrigin'
  }),
);
workbox.routing.registerRoute(
  /^https:\/\/.*\.kalpagramma\.com\/graphql\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'api'
  }),
);

workbox.routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google'
  }),
);

workbox.routing.registerRoute(
  /^https:\/\/storage\.yandexcloud\.net\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'content'
  }),
)

// workbox.routing.registerRoute(
//   new RegExp('^https://dev.kalpagramma.com/graphql'),
//   // async ({event, url}) => {
//   //   // See https://developers.google.com/web/tools/workbox/guides/route-requests#handling_a_route_with_a_custom_callback
//   //   // Do something here. What it is up to you.
//   //   // Eventually, return a Response object, or else your request will fail.
//   //   return response;
//   // },
//   async ({event, url}) => staleWhileRevalidate(event),
//   'POST'
// );

// workbox.routing.registerRoute(
//   /\.(?:js|css|json|png|gif|jpg|jpeg|webp|svg|woff2)$/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'sameOrigin',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxEntries: 60,
//         maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
//       }),
//     ],
//   })
// );
//
// workbox.routing.registerRoute(
//   new RegExp('^https://.*.kalpagramma.com/.*|^https://fonts.gstatic.com/.*'),
//   new workbox.strategies.CacheFirst({
//     cacheName: 'crossOrigin',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   }),
// );

self.addEventListener('message', function handler (event) {
  logFunc('message!', event.data)
  if (event.data && event.data.logModulesBlackList) {
    logModulesBlackList = event.data.logModulesBlackList
    logLevel = event.data.logLevel
    logLevelSentry = event.data.logLevelSentry
    if (logModulesBlackList.includes('sw')) workbox.setConfig({debug: false})
  }
  // var promise = self.clients.matchAll()
  //   .then(function (clientList) {
  //     logFunc('message! ', event.data)
  //     logFunc('message! clientList', clientList)
  //     logFunc('message! clientList', clientList)
  //     var senderID = event.source.id
  //
  //     clientList.forEach(function (client) {
  //       logFunc('message! postMessage', client)
  //       logFunc('message! postMessage', client)
  //       logFunc('message! postMessage', client)
  //       client.postMessage({
  //         client: senderID,
  //         message: event.data,
  //         self
  //       })
  //     })
  //   })
  // if (event.waitUntil) {
  //   event.waitUntil(promise)
  // }
})

self.addEventListener('install', event => {
  logFunc('installed!', swVer)
  // event.registerForeignFetch({
  //   scopes: ['/'],
  //   origins: ['*'] // or ['https://example.com']
  // })
})
self.addEventListener('activate', event => {
  logFunc('activated!', swVer)
})
self.addEventListener('fetch', async event => {
  logFunc('ready to handle fetches!', swVer, event.request.url)
  // if (event.request.method === 'POST') {
  //   const formData = await event.request.formData()
  //   // event.respondWith(fetch(event.request))
  //   logFunc('fetch post message!', swVer, event)
  //   logFunc('SW formData = ', formData)
  //   for (var value of formData.values()) {
  //     logFunc('SW formData value = ', value);
  //   }
  //   logFunc('SW formData title = ', formData.get('title'))
  //   logFunc('SW formData text = ', formData.get('text'))
  //   logFunc('SW formData url = ', formData.get('url'))
  //   logFunc('SW formData file = ', formData.get('file'))
  //   logFunc('SW formData files = ', formData.get('files'))
  //   await self.clients.openWindow('/app/create/')
  // }

  // event.respondWith((async () => {
  //   const formData = await event.request.formData()
  //   logFunc('SW formData = ', formData)
  //   logFunc('SW formData = ', formData.get('title'))
  //   logFunc('SW formData = ', formData.get('text'))
  //   logFunc('SW formData = ', formData.get('url'))
  //   logFunc('SW formData = ', formData.get('files'))
  // })())
})
self.addEventListener('updatefound', event => {
  logFunc('ready to update!', swVer)
})
self.addEventListener('error', function (e) {
  errCritFunc(e)
})

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
