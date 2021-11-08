import { notify } from 'src/boot/notify'
import { AuthApi } from 'src/api/auth'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { Notify, Platform } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { clear, get, Store } from 'public/scripts/idb-keyval/idb-keyval.mjs'
import { router } from 'src/boot/system'
import { makeRoutePath } from 'public/scripts/common_func'
import { shareIn } from 'src/system/services'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.PWA)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.PWA)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.PWA)

let registration = null // ServiceWorkerRegistration
const forceUpdatePWA = true // обновлять приложение без разрешения прользователя

async function initPWA (store) {
   const f = initPWA
   logD(f, 'initPWA start')
   const t1 = performance.now()
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
      // init sw
      {
         logD('try navigator.serviceWorker.register service-worker.js. controller=', navigator.serviceWorker.controller)
         if (navigator.serviceWorker.controller) window.KALPA_LOAD_SW_STATUS = 'active'
         else window.KALPA_LOAD_SW_STATUS = 'not_installed'
         // sw уже зарегистрирован. ф-ей register можно пользоваться для получения текущей регистрации
         registration = await navigator.serviceWorker.register('/service-worker.js')
         logD('navigator.serviceWorker.register service-worker.js OK!')
         for (let sw of [registration.installing, registration.waiting, registration.active]) {
            if (sw) {
               // установить фильтр логирования
               sw.postMessage({
                  type: 'logInit',
                  logDbgFilter: store.state.core.logDbgFilter,
                  logLevel: store.state.core.logLevel,
                  logLevelSentry: store.state.core.logLevelSentry
               })
            }
         }
         if (registration.waiting && registration.active) {
            // The page has been loaded when there's already a waiting and active SW.
            // This would happen if skipWaiting isn't being called, and there are
            // still old tabs open.
            if (forceUpdatePWA) await updatePWA()
            else {
               // updatePWA() будет вызвано по действию пользователя
               store.commit('core/stateSet', ['newVersionAvailable', true])
               showNotifyNewVer()
            }
         } else {
            // updatefound is also fired for the very first install. ¯\_(ツ)_/¯
            registration.addEventListener('updatefound', () => {
               // If updatefound is fired, it means that there's
               // a new service worker being installed.
               logD('updatefound...')
               let newSW = registration.installing
               newSW.addEventListener('statechange', (event) => {
                  if (event.target.state === 'installed') {
                     if (registration.active) {
                        // If there's already an active SW, and skipWaiting() is not
                        // called in the SW, then the user needs to close all their
                        // tabs before they'll get updates.
                        logW('Please close all tabs to get updates.')
                        // todo show prompt for SW to activate sw immediately and reload page
                        newSW.postMessage({ type: 'skipWaiting' })
                        store.commit('core/stateSet', ['newVersionAvailable', true])
                        if (!forceUpdatePWA) {
                           showNotifyNewVer()
                        } else {
                           notify('info', 'new version will installed!')
                           updatePWA().then(() => {
                              notify('info', 'version updated!')
                           })
                        }
                     } else {
                        // Otherwise, this newly installed SW will soon become the
                        // active SW. Rather than explicitly wait for that to happen,
                        // just show the initial "content is cached" message.
                        logW('Content is cached for the first time! please wait...')
                     }
                  }
               })
            })
         }
         { // получаем данные из sw
            navigator.serviceWorker.addEventListener('message', function handler (event) {
               let eventData = event.data
               if (event.data.isFirebaseMessaging) { // если окно открыто - уведомления приходят сюда - иначе - в сервисворкер
                  let payload = event.data.data
                  logD('web push message recieved!!!', payload)
                  showNotification(payload.title, payload.body, payload.event)
               } else if (eventData.type === 'swVer') {
                  logD('sw version =', eventData.msgData)
                  store.commit('core/stateSet', ['version', `${store.state.core.version}-${eventData.msgData}`])
               } else if (eventData.type === 'webPushToken') {
                  logD('webPushToken =', eventData.msgData)
                  AuthApi.setWebPushToken(eventData.msgData)
               } else {
                  logD('sw unknown message recieved!', eventData)
               }
            })
            if (registration.active) {
               registration.active.postMessage({ type: 'sendVersion' }) // просим сообщить swVer
               registration.active.postMessage({ type: 'sendWebPushToken' }) // просим сообщить webPushToken
               // registration.active.postMessage({ type: 'precacheAndRoute' })
            }
            // setTimeout(async () => {
            //
            // }, 5000)
         }
      }
      logD('initSw complete')
      // await initWebPush(store)
   } else {
      logW('serviceWorker disabled!')
   }

   // share into app (pwa)
   router.beforeEach(async (to, from, next) => {
      if (to.path === '/share') {
         // const toBase64 = file => new Promise((resolve, reject) => {
         //   const reader = new FileReader()
         //   reader.readAsDataURL(file)
         //   reader.onload = () => resolve(reader.result)
         //   reader.onerror = error => reject(error)
         // })
         logD('mounted')
         const swShareStore = new Store('sw-share', 'request-formData')
         let shareData = await get('shareData', swShareStore)
         if (shareData) {
            // alert('share to Kalpagrama! shareData (see store.core.state.shareData)=\n' + JSON.stringify(shareData))
            await shareIn({ contentUrl: shareData.contentUrl })
            this.$logD('shareData=', shareData)
         } else next('/')
      } else next()
   })

   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

async function pwaShareWith (title, text, url) {
   if (!('share' in navigator)) {
      alert('Web Share API not supported!!!')
      return
   }
   await navigator.share({ title: '', text: '', url })
}

async function pwaReset () {
   const f = pwaReset
   logD(f, 'start')
   const t1 = performance.now()
   if (registration && registration.waiting) { // если есть новый ожидающий SW - активируем его
      registration.waiting.postMessage({ type: 'skipWaiting' })
   }
   if (registration) {
      logD(f, 'try registration.unregister...')
      registration.unregister().then(() => {
         logD(f, 'registration.unregister success')
      }).catch((err) => {
         logD(f, 'registration.unregister err', err)
      })
      // вызывает проблемы (кэш самостоятельно не запрашивается после этого)
      // caches.keys().then(cacheNames => {
      //   cacheNames.forEach(cacheName => { // прекэш сам обновляется( + у файлов уникальный префикс). Если удалить, то в след раз он заполнится только при инсталляции воркера!
      //     if (force || !cacheName.startsWith('kalpa-precache')) {
      //       logD(f, 'clear cacheDb. cacheName=', cacheName)
      //       caches.delete(cacheName)
      //       logD(f, 'clear cacheDb. Ok!', cacheName)
      //     }
      //   })
      // })
   }
   logD(f, 'try clear sw Idb')
   const swShareStore = new Store('sw-share', 'request-formData')
   const videoStore = new Store('sw-cache-video', 'video-responses')
   await clear(swShareStore)
   await clear(videoStore)
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

function showNotifyNewVer () {
   Notify.create(
      {
         position: 'top',
         message: i18n.t('new_ver_avail', 'new version available'),
         actions: [{
            label: i18n.t('update_app', 'Update application'),
            noDismiss: true,
            handler: async () => {
               await updatePWA()
            }
         }]
      }
   )
}

// если есть новая версия - вызовется showNotifyNewVer
async function checkUpdate () {
   logD('checkUpdate1')
   if (registration) {
      logD('checkUpdate2')
      await registration.update()
   }
}

async function updatePWA () {
   await pwaReset()
   logW('before reload!')
   await window.location.reload()
}

async function askForPwaWebPushPerm (store) {
   return new Promise((resolve, reject) => {
      if (Platform.is.safari && !Platform.is.ios) {
         return resolve(false)
         // safari mobile (partial support)
         // todo
         // assert(window.safari)
         // if ('pushNotification' in window.safari) {
         //   logE('Push notifications are not supported!!!')
         //   return resolve(false)
         // }
         // let permissionData = window.safari.pushNotification.permission('web.app.kalpa')
         // const checkRemotePermission = (permissionData) => {
         //   if (permissionData.permission === 'default') {
         //     // This is a new web service URL and its validity is unknown.
         //     window.safari.pushNotification.requestPermission(
         //       'https://kalpa.app', // The web service URL.
         //       'web.app.kalpa', // The Website Push ID.
         //       {}, // Data that you choose to send to your server to help you identify the user.
         //       checkRemotePermission // The callback function.
         //     )
         //   } else if (permissionData.permission === 'denied') {
         //     logW('User not allowed notifications')
         //   } else if (permissionData.permission === 'granted') {
         //     // The web service URL is a valid push provider, and the user said yes.
         //     // permissionData.deviceToken is now available to use.
         //     logD('permissionData.deviceToken=', permissionData.deviceToken)
         //     store.commit('core/stateSet', ['webPushTokenDraft', permissionData.deviceToken])
         //   }
         // }
      } else if (Platform.is.chrome) {
         // chrome (full support)
         if (!('Notification' in window)) {
            logD('This browser does not support desktop notification')
            return resolve(false)
         }
         if (!('PushManager' in window)) {
            logE('Push notifications are not supported!!!')
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
      } else {
         return resolve(false)
      }
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
      AuthApi.setWebPushToken(permissionData.deviceToken).catch(err => {
         console.error('err on save in vuex:', err)
      })
   }
}

async function showNotification (title, body, dbEvent) {
   // if (registration) {
   //    dbEvent = JSON.stringify(dbEvent)
   //    const notificationTitle = title // `${event.type}`
   //    let options = {
   //       body: body, // `${event.object.name}`,
   //       data: dbEvent,
   //       icon: '/icons/icon-192x192.png',
   //       badge: '/icons/badge3.png',
   //       vibrate: [500, 100, 500],
   //       tag: 'tag: sample'
   //    }
   //    // let notification = new Notification('direct:' + title, options)
   //    // logD('notification=', notifications)
   //    if ('actions' in Notification.prototype) {
   //       // Action buttons are supported.
   //       options.actions = [
   //          {
   //             action: 'goto',
   //             title: 'перейти',
   //             icon: '/icons/favicon-32x32.png',
   //             handler: async () => {
   //                logD('action = go 1')
   //                // alert('goto 1')
   //                await router.push(makeRoutePath(dbEvent.object))
   //             }
   //          }
   //       ]
   //    } else {
   //       // Action buttons are NOT supported.
   //    }
   //    registration.showNotification(notificationTitle, options)
   // }

   dbEvent = typeof dbEvent === 'string' ? JSON.parse(dbEvent) : dbEvent
   Notify.create(
      {
         position: 'top',
         message: title,
         actions: [{
            label: i18n.t('goto...', 'перейти...'),
            noDismiss: true,
            handler: async () => {
               await router.push(makeRoutePath(dbEvent.object))
            }
         }]
      }
   )
}

export { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith }
