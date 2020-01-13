const swVer = 8
const useCache = true
let logDebug, logCritical, logModulesBlackList, logLevel, logLevelSentry, gqlStore, videoStore, swShareStore,
  cacheGraphQl,
  cacheVideo

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
// common init sw
{
  /* global idbKeyval, MD5 */
  importScripts('/statics/scripts/idb-keyval/idb-keyval-iife.min.js')
  importScripts('/statics/scripts/md5.js')
  logDebug('swVer=', swVer)
  logDebug('init idb')
  swShareStore = new idbKeyval.Store('sw-share', 'request-formData')
  gqlStore = new idbKeyval.Store('sw-cache-gql', 'graphql-responses')
  videoStore = new idbKeyval.Store('sw-cache-video', 'video-responses')
  logDebug('init idb ok')

  // workbox init
  {
    /* global workbox */
    // This will trigger the importScripts() for workbox.strategies and its dependencies:
    const { strategies } = workbox
    workbox.core.setCacheNameDetails({
      prefix: 'kalpa'
    })
    // workbox.core.skipWaiting() // небезопасно!!! может смешаться старый и новый код. Сделалано по-правильному см. src/system/service_worker/index.js
    workbox.core.clientsClaim()
    self.__precacheManifest = [].concat(self.__precacheManifest || [])
    // порядок вызовов precacheAndRoute и registerRoute имеет значение
    // precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
    workbox.precaching.precacheAndRoute(self.__precacheManifest, {})
    workbox.routing.registerRoute( // share_target
      /\/share_target\/?$/,
      async ({ url, event, params }) => {
        logDebug('share_target 1', url, workbox.precaching.getCacheKeyForURL('/index.html'))
        // if (event.request.method === 'POST') {
        //   logDebug('redirect to share_target = ')
        //   return Response.redirect('share_target', 303)
        // }
        if (url.pathname.includes('share_target')) {
          logDebug('share_target 6 ')
          try {
            let formData = await event.request.formData()
            // for (let [name, value] of formData) {
            //   shareData[name] = value
            // }
            let title = formData.get('title')
            let text = formData.get('text')
            let url = formData.get('url')
            let images = formData.getAll('image')
            let videos = formData.getAll('video')
            logDebug(' formData fields  = ', { title, text, url, images, videos })
            await idbKeyval.set('shareData', { title, text, url, images, videos }, swShareStore)
          } catch (err) {
            logCritical('share_target err', err)
          }
        }
        if (workbox.precaching.getCacheKeyForURL('/index.html')) {
          logDebug('share_target returm from cache', url)
          return caches.match(workbox.precaching.getCacheKeyForURL('/index.html'))
        } else {
          logDebug('share_target returm from net', url)
          return fetch('/index.html')
        }
      },
      'POST'
    )
  }

  // listeners
  {
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
      // logDebug('ready to handle fetches! request=', event.request)
    })
    self.addEventListener('updatefound', event => {
      logDebug('ready to update!', swVer)
      self.registration.showNotification('new version available')
    })
    self.addEventListener('error', function (e) {
      logCritical(e)
    })
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
          case 'sendVersion':
            self.clients.matchAll().then(all => all.map(client => client.postMessage(swVer)))
            break
          default:
            logCritical('bad event.data.type', event.data.type)
        }
      } else {
        logCritical('event.data is null')
      }
    })
  }
}

if (useCache) {
  // custom resolver for graphql & video requests
  {
    cacheGraphQl = async function (event) {
      try {
        logDebug('cacheGraphQl start')
        // return await networkOnly(event)// для кэширования gql используется apollo-cache-persist src/boot/apollo.js:10
        // // eslint-disable-next-line no-unreachable
        let requestCopy = event.request.clone()
        let body
        try {
          body = await requestCopy.json()
        } catch (err) {
        }
        if (!body || !body.operationName) return await networkOnly(event) // например, upload (multipart/form-data)
        logDebug('gql cacheGraphQl', body.operationName)
        let type = body && body.query && body.query.startsWith('mutation') ? 'mutation' : 'query'
        if (body.operationName.startsWith('sw_network_only_')) {
          return await networkOnly(event)
        } else if (body.operationName.startsWith('sw_cache_only_')) {
          return await cacheOnly(event, gqlStore)
        } else if (body.operationName.startsWith('sw_network_first_')) {
          return await networkFirst(event, gqlStore, 1200)
        } else if (body.operationName.startsWith('sw_cache_first_')) {
          return await cacheFirst(event, gqlStore)
        } else if (body.operationName.startsWith('sw_stale_')) {
          return await StaleWhileRevalidate(event, gqlStore)
        } else {
          logDebug(`gql warn. query ${body.operationName} not contains sw strategy. use defaults`)
          if (type === 'mutation') {
            return await networkFirst(event, gqlStore)
          } else {
            return await networkFirst(event, gqlStore)
          }
        }
      } catch (e) {
        logCritical('error on cacheGraphQl', e)
        throw e
        // return await networkOnly(event)
      }
    }
    cacheVideo = async function (event) {
      // let requestCopy = event.request.clone()
      // logDebug('video cacheVideo', requestCopy.url, requestCopy)
      return await cacheFirst(event, videoStore)
    }
    const cacheOnly = async (event, store) => {
      return await getCache(event.request, store)
    }
    const networkOnly = async (event) => {
      return await fetch(event.request.clone())
    }
    const StaleWhileRevalidate = async (event, store) => {
      logDebug('gql StaleWhileRevalidate')
      let cachedResponse = await cacheOnly(event, store)
      let fetchPromise = fetch(event.request.clone())
        .then(async (response) => {
          if (response && response.ok) await setCache(event.request, response, store)
          return response
        })
        .catch((err) => {
          logCritical('cant fetch gql query with StaleWhileRevalidate', err)
        })
      return cachedResponse ? cachedResponse : await fetchPromise
    }
    // Если по истечении timeout ответ не получен - ответить из кэша
    const networkFirst = async (event, store, timeout) => {
      logDebug('gql networkFirst')
      let cachedResponse = await cacheOnly(event, store)
      return await new Promise((resolve, reject) => {
        let timeoutId
        if (cachedResponse && timeout) {
          timeoutId = setTimeout(() => {
            logDebug('gql networkFirst. time expired. resolve from cache ok!')
            resolve(cachedResponse)
          }, timeout)
        }
        networkOnly(event).then(async (networkResponse) => {
          logDebug('gql networkFirst. resolve from network ok!', networkResponse)
          if (timeoutId) clearTimeout(timeoutId)
          if (networkResponse && networkResponse.ok) {
            logDebug('gql networkFirst. save to cache...')
            await setCache(event.request, networkResponse, store)
          }

          resolve(networkResponse)
        }).catch(err => {
          if (cachedResponse) {
            logDebug('gql networkFirst. fails. resolve from cache ok!', err)
            resolve(cachedResponse)
          }
          logDebug('gql networkFirst. fails.', err)
          reject(err)
        })
      })
    }
    const cacheFirst = async (event, store) => {
      logDebug('gql cacheFirst')
      let cachedResponse = await cacheOnly(event, store)
      if (cachedResponse) return cachedResponse
      return await networkFirst(event, store)
    }

    // сделает из response данные для хранения в кэше
    const prepareResponse = async (response, request) => {
      let requestCopy = request.clone()
      let responseCopy = response.clone()
      let serializedHeaders = {}
      for (let entry of responseCopy.headers.entries()) {
        serializedHeaders[entry[0]] = entry[1]
      }
      let res = {
        request: await prepareRequest(requestCopy),
        headers: serializedHeaders,
        status: responseCopy.status,
        statusText: responseCopy.statusText,
        body: await responseCopy.arrayBuffer()// await response.json()
      }
      return res
    }
    // сделает из request данные для ключа в кэше
    const prepareRequest = async (request) => {
      let requestCopy = request.clone()
      let serializedHeaders = {}
      for (let entry of requestCopy.headers.entries()) {
        if (!['range'].includes(entry[0].toLowerCase())) continue // остальные заголовки считаем несущественными для ключа
        serializedHeaders[entry[0]] = entry[1]
      }
      let res = {
        url: requestCopy.url,
        headers: serializedHeaders
      }
      if (requestCopy.method === 'POST') {
        res.body = await requestCopy.json()
      }
      return res
    }
    const setCache = async (request, response, store) => {
      logDebug('save to cache...')
      if (!store) {
        logCritical('bad store!!!')
        throw new Error('bad store!!!')
      }
      let reqPrepared = await prepareRequest(request)
      let entry = {
        request: reqPrepared,
        response: await prepareResponse(response, request),
        timestamp: Date.now()
      }
      let id = MD5(JSON.stringify(reqPrepared)).toString()

      await idbKeyval.set(id, entry, store)
      logDebug('save to cache ok!')
    }
    const getCache = async (request, store) => {
      if (!store) {
        logCritical('bad store!!!')
        throw new Error('bad store!!!')
      }
      let reqPrepared = await prepareRequest(request)
      try {
        let entry
        let id = MD5(JSON.stringify(reqPrepared)).toString()
        entry = await idbKeyval.get(id, store)
        if (!entry) {
          logDebug('Load response not found in cache.')
          return null
        }
        // // Check cache max age.
        // let cacheControl = requestCopy.headers.get('Cache-Control')
        // let maxAge = cacheControl ? parseInt(cacheControl.split('=')[1]) : 3600
        // if (Date.now() - data.timestamp > maxAge * 1000) {
        //   logDebug('Cache expired. Load from API endpoint.')
        //   return null
        // }
        logDebug('Load response from cache.', entry)
        return new Response(entry.response.body, entry.response)
      } catch (err) {
        logCritical('cant getCache', err)
        return null
      }
    }
  }
// routing
  {
    workbox.routing.registerRoute(
      /^http.*(?:googleapis|gstatic)\.com\/.*/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'google',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 100
          })
        ]
      })
    )
    workbox.routing.registerRoute( // vue router ( /menu /create etc looks at index.html)
      /\/(?!graphql)\w+\/?$/,
      async ({ url, event, params }) => {
        logDebug('vue router 1', url, workbox.precaching.getCacheKeyForURL('/index.html'))
        if (workbox.precaching.getCacheKeyForURL('/index.html')) {
          return caches.match(workbox.precaching.getCacheKeyForURL('/index.html'))
        } else {
          return fetch('/index.html')
        }
      }
    )
    workbox.routing.registerRoute( // content images
      /^http.*(yandexcloud|local_object_storage).+\.jpg$/,
      new workbox.strategies.CacheFirst({
        cacheName: 'content_img',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 2000
          })
        ]
      })
    )
    workbox.routing.registerRoute( // content video
      /^http.*(yandexcloud|local_object_storage).+\.mp4$/,
      ({ url, event, params }) => cacheVideo(event)
    )
    workbox.routing.registerRoute(// graphql
      /^http.*\/graphql\/?$/,
      ({ url, event, params }) => cacheGraphQl(event),
      'POST'
    )
    // This "catch" handler is triggered when any of the other routes fail to
    // generate a response.
    workbox.routing.setCatchHandler(async ({ event }) => {
      // The FALLBACK_URL entries must be added to the cache ahead of time, either via runtime
      // or precaching.
      // If they are precached, then call workbox.precaching.getCacheKeyForURL(FALLBACK_URL)
      // to get the correct cache key to pass in to caches.match().
      //
      // Use event, request, and url to figure out how to respond.
      // One approach would be to use request.destination, see
      // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c

      switch (event.request.destination) {
        case 'image': {
          logDebug('fallback image', event.request.url, 'to', workbox.precaching.getCacheKeyForURL('/statics/fallback_image.png'))
          return caches.match(workbox.precaching.getCacheKeyForURL('/statics/fallback_image.png'))
        }
        case 'video': {
          logDebug('fallback video', event.request.url, 'to', workbox.precaching.getCacheKeyForURL('/statics/fallback_video.mp4'))
          return caches.match(workbox.precaching.getCacheKeyForURL('/statics/fallback_video.mp4'))
        }
        default:
          logDebug('fallback default (get from network)', event.request)
          // If we don't have a fallback, just return an error response.
          return Response.error()
        // return await fetch(event.request)
        // return await fetch(event)
      }
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
