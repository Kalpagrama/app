const swVer = 5
const useCache = true

let logDebug, logCritical, logModulesBlackList, logLevel, logLevelSentry
// log
{
  logModulesBlackList = []
  logLevel = 0
  logLevelSentry = 3
  /* global importScripts */
  // importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
  /* global Sentry */
  // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })

  logDebug = (...msg) => {
    if (logModulesBlackList.includes('sw')) return
    if (logLevel <= 2) console.log('SW: ', swVer, ...msg)
    // if (logLevelSentry <= 2) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
  }

  logCritical = (...msg) => {
    if (logLevel <= 4) console.error(...msg)
    // if (logLevelSentry <= 4) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
  }
}
logDebug('swVer=', swVer)

// custom staleWhileRevalidate for POST requests
let staleWhileRevalidate = async (event) => {
  logDebug('staleWhileRevalidate dummy...')
}
{
  /* global idbKeyval, MD5 */
  // idb-keyval-iife.min.js
  importScripts('/statics/scripts/idb-keyval/idb-keyval-iife.min.js')
  importScripts('/statics/scripts/md5.js')
  logDebug('create common-data...')
  const swStore = new idbKeyval.Store('sw-cache-common', 'common-data')
  logDebug('create graphql-responses...')
  const gqlStore = new idbKeyval.Store('sw-cache-gql', 'graphql-responses')
  idbKeyval.set('swVer', swVer, swStore)

  staleWhileRevalidate = async function (event) {
    // let tmpReq = event.request.clone()
    // logDebug('staleWhileRevalidate...', 'body = ', await tmpReq.json(), tmpReq)
    // let promise = null
    // if(event.request.method === 'POST')
    let cachedResponse = await getCache(event.request.clone())
    let fetchPromise = fetch(event.request.clone())
      .then((response) => {
        setCache(event.request.clone(), response.clone())
        return response
      })
      .catch((err) => {
        logCritical(err)
      })
    return cachedResponse ? Promise.resolve(cachedResponse) : fetchPromise
  }

  async function serializeResponse (response) {
    let serializedHeaders = {}
    for (let entry of response.headers.entries()) {
      serializedHeaders[entry[0]] = entry[1]
    }
    let serialized = {
      headers: serializedHeaders,
      status: response.status,
      statusText: response.statusText
    }
    serialized.body = await response.json()
    return serialized
  }

  async function setCache (request, response) {
    let body = await request.json()
    // logDebug('body === ', body)
    // if (!body.operationName.startsWith('sw_cache_')) return
    let id = MD5(JSON.stringify(body)).toString()
    // logDebug('MD5 === ', id)
    // logDebug('request = ', request)
    let entry = {
      query: body.query,
      response: await serializeResponse(response),
      timestamp: Date.now()
    }
    idbKeyval.set(id, entry, gqlStore)
  }

  async function getCache (request) {
    let data
    try {
      let body = await request.json()
      let id = MD5(JSON.stringify(body)).toString() // CryptoJS.MD5(body.query).toString()
      data = await idbKeyval.get(id, gqlStore)
      if (!data) {
        logDebug('Load response not found in cache.')
        return null
      }
      // // Check cache max age.
      // let cacheControl = request.headers.get('Cache-Control')
      // let maxAge = cacheControl ? parseInt(cacheControl.split('=')[1]) : 3600
      // if (Date.now() - data.timestamp > maxAge * 1000) {
      //   logDebug('Cache expired. Load from API endpoint.')
      //   return null
      // }
      logDebug('Load response from cache.')
      return new Response(JSON.stringify(data.response.body), data.response)
    } catch (err) {
      return null
    }
  }
}

if (useCache) {
// workbox init
  {
    /* global workbox */
    workbox.core.setCacheNameDetails({ prefix: 'kalpa' })
    // workbox.core.skipWaiting() // небезопасно!!! может смешаться старый и новый код. Сделалано по-правильному см. src/system/service_worker/index.js
    workbox.core.clientsClaim()

    // порядок вызовов precacheAndRoute и registerRoute имеет значение
    // precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
    self.__precacheManifest = [].concat(self.__precacheManifest || [])
    workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
  }
// routing
  {
    // This will trigger the importScripts() for workbox.strategies and its dependencies:
    const { strategies } = workbox
    workbox.routing.registerRoute(
      /.*(?:googleapis|gstatic)\.com\/.*/,
      new workbox.strategies.CacheFirst({
        cacheName: 'google'
      })
    )
    workbox.routing.registerRoute(
      /^https:\/\/.*\.kalpagramma\.com\/?(?:menu|trends|create|workspace)?\/?$s/,
      new workbox.strategies.CacheFirst({
        cacheName: 'origin'
      })
    )
    workbox.routing.registerRoute(
      /^https:\/\/storage\.yandexcloud\.net\/.*/,
      new workbox.strategies.CacheFirst({
        cacheName: 'content'
      })
    )
    workbox.routing.registerRoute(
      /^https:\/\/.*\.kalpagramma\.com\/local_object_storage\/.*/,
      new workbox.strategies.CacheFirst({
        cacheName: 'content'
      })
    )
    workbox.routing.registerRoute(
      /^https:\/\/.*\.kalpagramma\.com:?[0-9]*\/graphql.*/,
      async ({ url, event, params }) => staleWhileRevalidate(event),
      'POST'
    )
  }
// listeners
  {
    self.addEventListener('message', function handler (event) {
      logDebug('message!', event.data)
      if (event.data) {
        switch (event.data.type) {
          case 'logInit':
            logModulesBlackList = event.data.logModulesBlackList
            logLevel = event.data.logLevel
            logLevelSentry = event.data.logLevelSentry
            try {
              if (logModulesBlackList.includes('sw')) workbox.setConfig({ debug: false })
            } catch (err) {
              logDebug('error on setConfig', err)
            }
            break
          case 'skipWaiting':
            self.skipWaiting()
            break
          default:
            logCritical('bad event.data.type', event.data.type)
        }
      } else {
        logCritical('event.data is null')
      }
    })
    self.addEventListener('install', event => {
      logDebug('installed!', swVer)
      // event.registerForeignFetch({
      //   scopes: ['/'],
      //   origins: ['*'] // or ['https://example.com']
      // })
    })
    self.addEventListener('activate', event => {
      logDebug('activated!', swVer)
    })
    self.addEventListener('fetch', async event => {
      logDebug('ready to handle fetches!', event.request.url)
      // if (event.request.url.match(/^https:\/\/.*\.kalpagramma\.com:?[0-9]*\/graphql.*/)) {
      //   logDebug('gql query')
      //   let tmpReq = event.request.clone()
      //   logDebug('staleWhileRevalidate...', 'body = ', await tmpReq.json(), tmpReq)
      //   event.respondWith(staleWhileRevalidate(event))
      // }

      // if (event.request.method === 'POST') {
      //   const formData = await event.request.formData()
      //   // event.respondWith(fetch(event.request))
      //   logDebug('fetch post message!', swVer, event)
      //   logDebug('SW formData = ', formData)
      //   for (var value of formData.values()) {
      //     logDebug('SW formData value = ', value);
      //   }
      //   logDebug('SW formData title = ', formData.get('title'))
      //   logDebug('SW formData text = ', formData.get('text'))
      //   logDebug('SW formData url = ', formData.get('url'))
      //   logDebug('SW formData file = ', formData.get('file'))
      //   logDebug('SW formData files = ', formData.get('files'))
      //   await self.clients.openWindow('/app/create/')
      // }
      // event.respondWith((async () => {
      //   const formData = await event.request.formData()
      //   logDebug('SW formData = ', formData)
      //   logDebug('SW formData = ', formData.get('title'))
      //   logDebug('SW formData = ', formData.get('text'))
      //   logDebug('SW formData = ', formData.get('url'))
      //   logDebug('SW formData = ', formData.get('files'))
      // })())
    })
    self.addEventListener('updatefound', event => {
      logDebug('ready to update!', swVer)
      self.registration.showNotification('new version available')
    })
    self.addEventListener('error', function (e) {
      logCritical(e)
    })
  }
}

// web-push
{
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
      logDebug('[firebase-messaging-sw.js] Received background message ', payload)

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
      logDebug('test action was clicked')
      self.clients.openWindow('/trends/SCIENCE?sort=HOT')
    } else {
      // Main body of notification was clicked
      self.clients.openWindow('/')
    }
  }, false)
}
