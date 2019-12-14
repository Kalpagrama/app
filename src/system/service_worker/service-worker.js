const swVer = 7
let logFunc, errCritFunc
{ // log
  let logModulesBlackList = []
  let logLevel = 0
  let logLevelSentry = 3
  importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
  Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })

  logFunc = (...msg) => {
    if (logModulesBlackList.includes('sw')) return
    if (logLevel <= 2) console.log('SW: ', swVer, ...msg)
    if (logLevelSentry <= 2) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
  }

  errCritFunc = (...msg) => {
    if (logLevel <= 4) console.error(...msg)
    if (logLevelSentry <= 4) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
  }
}

logFunc('SW_VER=', swVer)

/* global workbox */
{
  workbox.core.setCacheNameDetails({
    prefix: 'kalpa',
    suffix: `v${swVer}`,
    precache: 'installTime',
    runtime: 'runTime',
    googleAnalytics: 'googleAnalytics',
  })
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()

// порядок вызовов precacheAndRoute и registerRoute имеет значение
// precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
  self.__precacheManifest = [].concat(self.__precacheManifest || [])
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

  // This will trigger the importScripts() for workbox.strategies and its dependencies:
  const {strategies} = workbox;
}

// workbox.routing.registerRoute(
//   /\/.*/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'sameOrigin'
//   }),
// );
workbox.routing.registerRoute(
  /^https:\/\/.*\.kalpagramma\.com\/graphql\/.*/,
  ({url, event, params}) => {
    logFunc(' catch gql query')
    // Using the previously-initialized strategies.
    const cacheFirst = new strategies.CacheFirst()
    event.respondWith(cacheFirst.makeRequest({request: event.request}));
    // return fetch(event.request)
    //   .then((response) => {
    //     return response.text();
    //   })
    //   .then((responseBody) => {
    //     return new Response(`${responseBody} <!-- Look Ma. Added Content. -->`);
    //   });
  }
);
//
// workbox.routing.registerRoute(
//   /.*(?:googleapis|gstatic)\.com/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'google'
//   }),
// );
//
// workbox.routing.registerRoute(
//   /^https:\/\/storage\.yandexcloud\.net\/.*/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'content'
//   }),
// )

self.addEventListener('message', function handler (event) {
  logFunc('message!', event.data)
  if (event.data && event.data.logModulesBlackList) {
    logModulesBlackList = event.data.logModulesBlackList
    logLevel = event.data.logLevel
    logLevelSentry = event.data.logLevelSentry
    try {
      if (logModulesBlackList.includes('sw')) workbox.setConfig({ debug: false })
    } catch (err) {
      logFunc('error on setConfig', err)
    }
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
  logFunc('ready to handle fetches!1', swVer, event.request.url)
  logFunc('ready to handle fetches!2', swVer, event.request.url)
  logFunc('ready to handle fetches!3', swVer, event.request.url)
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
    self.clients.openWindow('/trends/SCIENCE?sort=HOT')
  } else {
    // Main body of notification was clicked
    self.clients.openWindow('/')
  }
}, false)
