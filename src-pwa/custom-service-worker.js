/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

const swVer = 7
const useCache = true
self.__WB_DISABLE_DEV_LOGS = true // отключаем дебаговый вывод workbox

// import { setCacheNameDetails } from 'workbox-core'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { getCacheKeyForURL, matchPrecache, precacheAndRoute } from 'workbox-precaching'
import { CacheFirst } from 'workbox-strategies/CacheFirst'
import { StaleWhileRevalidate } from 'workbox-strategies/StaleWhileRevalidate'
import { ExpirationPlugin } from 'workbox-expiration/ExpirationPlugin'

import { makeRoutePath, vueRoutesRegexp, wait } from 'src/../public/scripts/common_func'

let logD, logW, logE, logC, logDbgFilter, logLevel, logLevelSentry, videoStore, swShareStore,
   cacheGraphQl,
   cacheVideo, messaging

async function sendMsg (type, msgData) {
   const all = await self.clients.matchAll()
   // logD('sendMsg::messaging.self.clients.matchAll() = ', all)
   for (const client of all) {
      client.postMessage({ type, msgData })
   }
}

// log
{
   logDbgFilter = 'sys'
   logLevel = 0
   logLevelSentry = 3
   /* global importScripts */
   // importScripts('https://browser.sentry-cdn.com/5.9.1/bundle.min.js')
   /* global Sentry */
   // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })

   logD = (...msg) => {
      if (logDbgFilter === 'gui') return
      if (logLevel === 0) console.log('SW: ', swVer, (new Date()).toLocaleTimeString(), ...msg)
   }

   logW = (...msg) => {
      if (logLevel <= 2) console.warn('SW: ', swVer, (new Date()).toLocaleTimeString(), ...msg)
   }

   logE = (...msg) => {
      if (logLevel <= 3) console.error('SW: ', swVer, (new Date()).toLocaleTimeString(), ...msg)
   }

   logC = (...msg) => {
      if (logLevel <= 4) console.error('SW: ', swVer, (new Date()).toLocaleTimeString(), ...msg)
      // if (logLevelSentry <= 4) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
   }
}
// common init sw
{
   logD('common init sw', swVer, process.env.NODE_ENV)
   // precache
   {
      // precacheAndRoute позволяет в фоне предварительно закэшировать весь сайт при первой установке
      precacheAndRoute(self.__WB_MANIFEST)
   }
   /* global idbKeyval, MD5 */
   importScripts('/scripts/idb-keyval/idb-keyval-iife.min.js')
   importScripts('/scripts/md5.js')
   importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js')
   importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js')
   logD('swVer=', swVer)
   logD('init idb')
   swShareStore = new idbKeyval.Store('sw-share', 'request-formData')
   videoStore = new idbKeyval.Store('sw-cache-video', 'video-responses')
   logD('init idb ok')

   function initWebPush () {
      logD('try init web push with firebase...')
      // console.log('try init web push with firebase')
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
      logD('firebase.messaging.isSupported() = ', firebase.messaging.isSupported())
      // console.log('firebase.messaging.isSupported() = ', firebase.messaging.isSupported())
      let i = 0
      if (firebase.messaging.isSupported()) {
         try {
            messaging = firebase.messaging()
            // messaging.useServiceWorker(self.registration)
            // messaging.setBackgroundMessageHandler(function (payload) {
            //    logD('[firebase-messaging-sw.js] Received background message ')
            //    console.log('[firebase-messaging-sw.js] Received background message ')
            //    // Customize notification here
            //    //todo use payload.notification.title & payload.notification.body
            //    const dbEvent = JSON.parse(payload.data.event || '{}')
            //    const notificationTitle = payload.data.title
            //    const notificationOptions = {
            //       body: payload.data.body,
            //       data: dbEvent,
            //       icon: '/icons/icon-192x192.png',
            //       badge: '/icons/badge3.png',
            //       vibrate: [500, 100, 500],
            //       tag: payload.data.type, // Поле тега позволяет заменить старое уведомление на новое
            //       actions: [
            //          {
            //             action: 'goto',
            //             title: 'перейти к объекту',
            //             icon: '/icons/icon-192x192.png'
            //          }
            //       ]
            //    }
            //    return self.registration.showNotification(notificationTitle, notificationOptions)
            // })
         } catch (err) {
            logC('firebase init error!', err)
         }
      }
   }

   initWebPush()
   // workbox init
   {
      // setCacheNameDetails({
      //    prefix: 'kalpa'
      // })

      // force update sw
      // если необходимо немедленно обновить sw (иначе - зависнет в waiting до закрытия всех страниц) - раскомментировать строки ниже (не рекомендуется)
      // skipWaiting() // небезопасно!!! может смешаться старый и новый код. Сделалано по-правильному см. src/system/pwa.js
      // clientsClaim() // небезопасно!!! может смешаться старый и новый код. Сделалано по-правильному см. src/system/pwa.js

      registerRoute(/\/share\/?$/,
         async ({ url, event, params }) => {
            // logD('share 1', url, getCacheKeyForURL('/index.html'))
            // if (event.request.method === 'POST') {
            //   logD('redirect to share = ')
            //   return Response.redirect('share', 303)
            // }
            if (url.pathname.includes('share')) {
               logD('share 6 ')
               try {
                  let formData = await event.request.formData()
                  // for (let [name, value] of formData) {
                  //   shareData[name] = value
                  // }
                  let title = formData.get('title')
                  let text = formData.get('text')
                  let url = formData.get('url')
                  let contentUrl = text || url
                  let images = formData.getAll('image')
                  let videos = formData.getAll('video')
                  logD(' formData fields  = ', { title, text, url, images, videos })
                  await idbKeyval.set('shareData', { title, text, url, contentUrl, images, videos }, swShareStore)
               } catch (err) {
                  logC('share_target err', err)
               }
            }
            if (getCacheKeyForURL('/index.html')) {
               logD('share_target return from cache', url)
               return caches.match(getCacheKeyForURL('/index.html'))
            } else {
               logD('share_target returm from net', url)
               return fetch('/index.html')
            }
         },
         'POST'
      )
   }
   // listeners
   {
      self.addEventListener('install', event => { logD('installed!', swVer) })
      self.addEventListener('activate', event => {
         logD('activated!', swVer)
         // // TODO проблемы при обновлении приложения (все зависает) Возможно дело в этом...
         // const sendToken = async () => {
         //    await self.clients.claim() // перевести всех клиентов на себя
         //    let token = await messaging.getToken()
         //    await sendMsg('webPushToken', token) // послать всем новый токен
         //    await sendMsg('swVer', swVer)
         // }
         // // пришел новый сервис-воркер - отправить всем новый webPushToken
         // // TODO проблемы при обновлении приложения (все зависает) Возможно дело в этом...
         // event.waitUntil(sendToken())
      })
      self.addEventListener('updatefound', event => {
         logD('ready to update!', swVer)
         // self.registration.showNotification('new version available!') // сообщение в области уведомлений телефона
      })
      self.addEventListener('error', function (e) {
         logC('SW: on error!!!', e)
      })
      self.addEventListener('message', function handler (event) {
         logD('message!', event.data)
         const doFunc = async () => {
            if (event.data) {
               switch (event.data.type) {
                  case 'logInit':
                     logDbgFilter = event.data.logDbgFilter
                     logLevel = event.data.logLevel
                     logLevelSentry = event.data.logLevelSentry
                     break
                  // case 'precacheAndRoute':
                  //    if(!self.precacheAndRouteExecuted){
                  //       // precacheAndRoute позволяет предварительно закэшировать весь сайт при первой установке (хорошо для PWA)
                  //       logD('precacheAndRoute', __WB_MANIFEST_TMP)
                  //       precacheAndRoute(__WB_MANIFEST_TMP)
                  //       self.precacheAndRouteExecuted = true
                  //    }
                  //    break
                  case 'skipWaiting':
                     self.skipWaiting()
                     break
                  case 'sendVersion':
                     await sendMsg('swVer', swVer)
                     break
                  case 'sendWebPushToken':
                     logD('sendWebPushToken message!')
                     if (messaging) {
                        messaging.getToken().then(async token => {
                           logD('messaging.getToken() = ', token)
                           await sendMsg('webPushToken', token)
                        }).catch(err => logC('error on messaging.getToken(): ', err))
                     }
                     // sendMsg('webPushToken', webPushToken)
                     break
                  default:
                     logC('bad event.data.type', event.data.type)
               }
            } else {
               logC('event.data is null')
            }
         }
         event.waitUntil(doFunc())
      })
      self.addEventListener('notificationclick', function (event) {
         logD('notificationclick', event)
         // console.log('push notificationclick = ', event)

         event.notification.close()
         const dbEvent = typeof event.notification.data === 'string' ? JSON.parse(event.notification.data) : event.notification.data
         let route = makeRoutePath(dbEvent.object, true) || '/'
         // console.log('notificationclick:', dbEvent, route)
         event.waitUntil(
            // Получаем список клиентов SW.
            self.clients.matchAll({ type: 'window' }).then(function (clientList) {
               // Если есть хотя бы один клиент, фокусируем его.
               if (clientList.length > 0) {
                  if ('navigate' in clientList[0]) {
                     clientList[0].focus()
                     clientList[0].navigate(makeRoutePath(dbEvent.object) || '/')
                     return
                  }
               }
               // В противном случае открываем новую страницу.
               return self.clients.openWindow(makeRoutePath(dbEvent.object, true) || '/')
            })
         )
      }, false)
      self.addEventListener('push', function (event) {
         logD('push event recieved = ', event)
         // console.log('push event recieved = ', event)

         let payload = JSON.parse(event.data ? event.data.text() : '{}');
         // console.log('push message recieved = ', payload)

         event.waitUntil(
            // Получить список клиентов для SW
            self.clients.matchAll().then(function (clientList) {
               // Проверяем, есть ли хотя бы один сфокусированный клиент.
               let focused = clientList.some(function (client) {
                  return client.focused // есть клиент. Сообщение не показываем (надо отловить внутри клиента)
               })

               let notificationMessage
               if (focused) {
                  // * 1, страница сфокусирована;
               } else if (clientList.length > 0) {
                  // * 2, страница по-прежнему открыта, но не сфокусирована;
               } else {
                  // * 3, страница закрыта).
               }
               const dbEvent = JSON.parse(payload.data.event || '{}')
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
         )
      })
   }
}

if (useCache) {
// routing
   {
      // registerRoute(/^http.*(?:googleapis|gstatic)\.com\/.*/, new StaleWhileRevalidate({ cacheName: 'google' }))
      // картинки с категориями и пр
      registerRoute(/^http.*kalpa\.store\/static\/category_thumbs\/.+\.jpg$/,
         new CacheFirst({
            cacheName: 'static_back',
            fetchOptions: {
               credentials: 'same-origin', // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
               mode: 'cors', // для того чтобы пришел нормальный ответ (не opaque). Opaque не кэшируется
               headers: {
                  'Cache-Control': 'no-cache' // нужно тк иначе браузер кэширует картинки и они так оказваются без cors-заголовков (при получении такой картинки - происходит ошибка)
                  // 'x-my-custom-header': 'The Most Amazing Header Ever'
               }
            }
         }))
      // content images
      registerRoute(/^http.*(kalpa\.store|akamaized\.net).+\.jpg/,
         new CacheFirst({
            cacheName: 'content_img',
            plugins: [
               new ExpirationPlugin({
                  maxEntries: 1000,
                  // Automatically cleanup if quota is exceeded.
                  purgeOnQuotaError: true,
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
      registerRoute(/\/(icons|other|scripts)\/.*$/, new CacheFirst({ cacheName: 'static_front' }))
      registerRoute(/.+(\.jpg|\.ico|\.png)$/, new CacheFirst({ cacheName: 'static_front' })) // в конце
      // registerRoute(/^http.*(kalpa\.store|akamaized\.net).+\.mp4$/, async ({ url, event, params }) => {
      //    return fetch(event.request)
      // })
      // // почему-то закэшитрованное видео не играет...
      // registerRoute( // content video
      //   /^http.*(kalpa\.store).+\.mp4$/,
      //   ({ url, event, params }) => {
      //     logD('registerRoute video', event)
      //     return cacheVideo(event)
      //   }
      // )

      // vue router ( /menu /create etc looks at index.html)
      registerRoute(vueRoutesRegexp, async ({ url, event, params }) => {
         // logD('vue router 1', url, getCacheKeyForURL('/index.html'))
         if (getCacheKeyForURL('/index.html')) {
            return caches.match(getCacheKeyForURL('/index.html'))
         } else {
            return fetch('/index.html')
         }
      })

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
         logD('setCatchHandler', event)
         switch (event.request.destination) {
            case 'image': {
               logD('fallback image', event.request.url, 'to', getCacheKeyForURL('/icons/icon-512x512.png'))
               return matchPrecache('/icons/icon-512x512.png')
            }
            default:
               logD('fallback default', event.request)
               // If we don't have a fallback, just return an error response.
               return Response.error()
         }
      })
   }
}
