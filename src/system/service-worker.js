/* eslint-disable */

// InjectManifest in Workbox v5
// https://developers.google.com/web/tools/workbox/guides/migrations/migrate-from-v4
// https://gist.github.com/jeffposnick/fc761c06856fa10dbf93e62ce7c4bd57
import { setCacheNameDetails, skipWaiting, clientsClaim } from 'workbox-core'
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing'
import { getCacheKeyForURL } from 'workbox-precaching'
import { matchPrecache } from 'workbox-precaching'
import { createHandlerBoundToURL } from 'workbox-precaching'
import { CacheableResponsePlugin } from 'workbox-cacheable-response/CacheableResponsePlugin'
import { CacheFirst } from 'workbox-strategies/CacheFirst'
import { StaleWhileRevalidate } from 'workbox-strategies/StaleWhileRevalidate'
import { ExpirationPlugin } from 'workbox-expiration/ExpirationPlugin'
import { NavigationRoute } from 'workbox-routing/NavigationRoute'
import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute'
import {makeEventCard, makeRoutePath} from 'public/scripts/common_func'

// отключаем дебаговый вывод workbox
self.__WB_DISABLE_DEV_LOGS = true
// precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
precacheAndRoute(self.__WB_MANIFEST)

const swVer = 1
const useCache = true
let logDebug, logCritical, logDbgFilter, logLevel, logLevelSentry, videoStore, swShareStore,
   cacheGraphQl,
   cacheVideo, messaging

function sendMsg (type, msgData) {
   self.clients.matchAll().then(all => all.map(client => client.postMessage({ type, msgData })))
}

// log
{
   logDbgFilter = 'gui'
   logLevel = 0
   logLevelSentry = 3
   /* global importScripts */
   // importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
   /* global Sentry */
   // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })

   logDebug = (...msg) => {
      if (logDbgFilter === 'gui') return
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
   logDebug('common init sw', swVer)
   /* global idbKeyval, MD5 */
   importScripts('/scripts/idb-keyval/idb-keyval-iife.min.js')
   importScripts('/scripts/md5.js')
   importScripts('https://www.gstatic.com/firebasejs/7.15.4/firebase-app.js')
   importScripts('https://www.gstatic.com/firebasejs/7.15.4/firebase-messaging.js')
   logDebug('swVer=', swVer)
   logDebug('init idb')
   swShareStore = new idbKeyval.Store('sw-share', 'request-formData')
   videoStore = new idbKeyval.Store('sw-cache-video', 'video-responses')
   logDebug('init idb ok')

   function initWebPush () {
      logDebug('try init web push with firebase...')
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
      logDebug('firebase.messaging.isSupported() = ', firebase.messaging.isSupported())
      let i = 0
      if (firebase.messaging.isSupported()) {
         try {
            messaging = firebase.messaging()
            // messaging.useServiceWorker(self.registration)
            messaging.setBackgroundMessageHandler(function (payload) {
               logDebug('[firebase-messaging-sw.js] Received background message ', payload)

               // Customize notification here
               //todo use payload.notification.title & payload.notification.body
               const dbEvent = JSON.parse(payload.data.event)
               const notificationTitle = payload.data.title
               const notificationOptions = {
                  body: payload.data.body,
                  data: dbEvent,
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/badge3.png',
                  vibrate: [500, 100, 500],
                  tag: payload.data.type, // Поле тега позволяет заменить старое уведомление на новое
                  actions: [
                     {
                        action: 'goto',
                        title: 'перейти к объекту',
                        icon: '/icons/icon-192x192.png'
                     }
                  ]
               }
               return self.registration.showNotification(notificationTitle, notificationOptions)
            })
         } catch (err) {
            logCritical('firebase init error!', err)
         }
      }
   }

   initWebPush()
   // workbox init
   {
      setCacheNameDetails({
         prefix: 'kalpa'
      })
      // force update sw
      // если необходимо немедленно обновить sw (иначе - зависнет в waiting до закрытия всех страниц) - раскомментировать строки ниже (не рекомендуется)
      // skipWaiting() // небезопасно!!! может смешаться старый и новый код. Сделалано по-правильному см. src/system/pwa.js
      // clientsClaim()

      registerRoute(/\/share_target\/?$/,
         async ({ url, event, params }) => {
            logDebug('share_target 1', url, getCacheKeyForURL('/index.html'))
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
            if (getCacheKeyForURL('/index.html')) {
               logDebug('share_target returm from cache', url)
               return caches.match(getCacheKeyForURL('/index.html'))
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
         // if (messaging) {
         //   messaging.getToken().then(token => {
         //     logDebug('messaging.getToken() = ', token)
         //     webPushToken = token
         //   }).catch(err => logCritical('error on messaging.getToken(): ', err))
         // }
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
                  logDbgFilter = event.data.logDbgFilter
                  logLevel = event.data.logLevel
                  logLevelSentry = event.data.logLevelSentry
                  break
               case 'skipWaiting':
                  self.skipWaiting()
                  break
               case 'sendVersion':
                  sendMsg('swVer', swVer)
                  break
               case 'sendWebPushToken':
                  if (messaging) {
                     messaging.getToken().then(token => {
                        logDebug('messaging.getToken() = ', token)
                        sendMsg('webPushToken', token)
                     }).catch(err => logCritical('error on messaging.getToken(): ', err))
                  }
                  // sendMsg('webPushToken', webPushToken)
                  break
               default:
                  logCritical('bad event.data.type', event.data.type)
            }
         } else {
            logCritical('event.data is null')
         }
      })
      self.addEventListener('notificationclick', function (event) {
         logDebug('notificationclick', event)
         logDebug('notificationclick', event.notification.data)
         event.notification.close()
         const dbEvent = event.notification.data
         logDebug('notificationclick dbEvent', dbEvent)

         let route = makeRoutePath(dbEvent.object) || '/'
         event.waitUntil(
            // Получаем список клиентов SW.
            self.clients.matchAll({ type: 'window' }).then(function (clientList) {
               // Если есть хотя бы один клиент, фокусируем его.
               if (clientList.length > 0) {
                  if ('navigate' in clientList[0]) {
                     clientList[0].focus()
                     clientList[0].navigate(route)
                     return
                  }
               }
               // В противном случае открываем новую страницу.
               return self.clients.openWindow(route)
            })
         )
      }, false)
      self.addEventListener('push', function (event) {
         logDebug('push event recieved = ', event)
         let payload = event.data ? event.data.text() : 'Alohomora'

         event.waitUntil(
            // Получить список клиентов для SW
            self.clients.matchAll().then(function (clientList) {
               // Проверяем, есть ли хотя бы один сфокусированный клиент.
               var focused = clientList.some(function (client) {
                  return client.focused
               })

               var notificationMessage
               if (focused) {
                  notificationMessage = 'Imperio! You\'re still here, thanks!'
               } else if (clientList.length > 0) {
                  notificationMessage = 'Imperio! You haven\'t closed the page, ' +
                     'click here to focus it!'
               } else {
                  notificationMessage = 'Imperio! You have closed the page, ' +
                     'click here to re-open it!'
               }
               // Показывать уведомление с заголовком «Unforgiveable Curses»
               // и телом в зависимости от состоянию клиентов SW
               // * 1, страница сфокусирована;
               // * 2, страница по-прежнему открыта, но не сфокусирована;
               // * 3, страница закрыта).
               // return self.registration.showNotification('Unforgiveable Curses', {
               //    body: notificationMessage
               // })
            })
         )
      })
   }
}

if (useCache) {
   // custom resolver for graphql & video requests
   {
      cacheVideo = async function (event) {
         // let requestCopy = event.request.clone()
         // logDebug('video cacheVideo', requestCopy.url, requestCopy)
         return await cacheFirst(event, videoStore)
      }
      const cacheOnly = async (event, store) => {
         return await getCache(event.request, store)
      }
      const networkOnly = async (event) => {
         return await fetch(event.request.clone(), {
            credentials: 'same-origin', // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
            mode: 'cors' // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
         })
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
         if (cachedResponse) {
            logDebug('gql cacheFirst. resolve from cache ok!', cachedResponse)
            return cachedResponse
         }
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
      registerRoute(/^http.*(?:googleapis|gstatic)\.com\/.*/, new StaleWhileRevalidate({
         cacheName: 'google',
         plugins: [
            new ExpirationPlugin({
               maxEntries: 100
            })
         ]
      }))
      // vue router ( /menu /create etc looks at index.html)
      registerRoute(/\/(?!graphql)\w+\/?$/, async ({ url, event, params }) => {
         logDebug('vue router 1', url, getCacheKeyForURL('/index.html'))
         // logDebug('ask url=', url)
         // let xxx = await createHandlerBoundToURL('/index.html', true)
         // logDebug('ask url, createHandlerBoundToURL = ', xxx)
         // return xxx
         if (getCacheKeyForURL('/index.html')) {
            return caches.match(getCacheKeyForURL('/index.html'))
         } else {
            return fetch('/index.html')
         }
      })
      // content images
      registerRoute(/^http.*(kalpa\.store).+\.jpg$/,
         new CacheFirst({
            cacheName: 'content_img',
            plugins: [
               new ExpirationPlugin({
                  maxEntries: 2000
               })
            ],
            fetchOptions: {
               credentials: 'same-origin', // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
               mode: 'cors', // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
               headers: {
                  'Cache-Control': 'no-cache' // нужно тк иначе браузер кэширует картинки и они так оказваются без cors-заголовков (при получении такой картинки - происходит ошибка)
                  // 'x-my-custom-header': 'The Most Amazing Header Ever'

               }
            }
         })
      )
      // registerRoute(/^http.*(kalpa\.store).+\.jpg$/, async ({ url, event, params }) => {
      //    // Response will be "A guide to Workbox"
      //    // return new Response(
      //    //    `A ${params.type} to ${params.name}`
      //    // );
      //    // decide for yourself which values you provide to mode and credentials
      //    logDebug('decide for yourself which values you provide to mode and credentials')
      //    const newRequest = new Request(event.request, {
      //       mode: 'cors',
      //       credentials: 'omit',
      //       headers: {
      //          'x-my-custom-header': 'The Most Amazing Header Ever'
      //       }
      //    })
      //    event.respondWith(fetch(newRequest))
      // })

      // // почему-то закэшитрованное видео не играет...
      // registerRoute( // content video
      //   /^http.*(kalpa\.store).+\.mp4$/,
      //   ({ url, event, params }) => {
      //     logDebug('registerRoute video', event)
      //     return cacheVideo(event)
      //   }
      // )

      // This "catch" handler is triggered when any of the other routes fail to
      // generate a response.
      setCatchHandler(async ({ event }) => {
         // The FALLBACK_URL entries must be added to the cache ahead of time, either via runtime
         // or precaching.
         // If they are precached, then call getCacheKeyForURL(FALLBACK_URL)
         // to get the correct cache key to pass in to caches.match().
         //
         // Use event, request, and url to figure out how to respond.
         // One approach would be to use request.destination, see
         // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
         logDebug('setCatchHandler', event)
         switch (event.request.destination) {
            case 'image': {
               logDebug('fallback image', event.request.url, 'to', getCacheKeyForURL('/icons/icon-512x512.png'))
               return matchPrecache('/icons/icon-512x512.png')
            }
            default:
               logDebug('fallback default', event.request)
               // If we don't have a fallback, just return an error response.
               return Response.error()
         }
      })
   }
}
