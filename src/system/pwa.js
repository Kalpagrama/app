import { notify } from 'src/boot/notify'
import { AuthApi } from 'src/api/auth'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { Notify, Platform } from 'quasar'
import { t } from 'src/boot/i18n'
import { clear, get, createStore } from 'idb-keyval'
import { router } from 'src/boot/system'
import { makeRoutePath, wait } from 'src/system/common/common_func'
import { shareIn } from 'src/system/services'
import { assert } from 'src/system/common/utils'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.PWA)

let registration = null // ServiceWorkerRegistration
const forceUpdatePWA = false // обновлять приложение без разрешения прользователя

async function initPWA (store) {
   const f = initPWA
   logT(f, 'initPWA start')
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

         // let currRegistration = await navigator.serviceWorker.getRegistration('/')
         // assert(currRegistration)
         // if (!currRegistration.installing && !currRegistration.waiting && !currRegistration.active){
         //    logE('BAD Registration! try unregister sw!!!!', navigator.serviceWorker, currRegistration)
         //    await currRegistration.unregister()
         //    logD(' unregister sw OK!')
         // }

         // sw уже зарегистрирован. ф-ей register можно пользоваться для получения текущей регистрации
         logT('try register sw')
         registration = await navigator.serviceWorker.register('/service-worker.js')
         logT('navigator.serviceWorker.register sw OK!')
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
            // пришла новая версия, но еще активна текущая версия. (можно обновляться)
            // This would happen if skipWaiting isn't being called, and there are still old tabs open.
            logT('PWA update ready!', forceUpdatePWA)
            if (forceUpdatePWA) await updatePWA()
            else {
               // updatePWA() будет вызвано по действию пользователя
               showNotifyNewVer(store)
            }
         } else { // installing (приехала свежая версия) Но еще не успела перейти в статус waiting
            // updatefound is also fired for the very first install. ¯\_(ツ)_/¯
            registration.addEventListener('updatefound', () => {
               // If updatefound is fired, it means that there's
               // a new service worker being installed.
               logT('updatefound...')
               let newSW = registration.installing
               newSW.addEventListener('statechange', (event) => {
                  // alert('sw statechange: ' + event.target.state)
                  if (event.target.state === 'installed') {
                     if (registration.active) {
                        // If there's already an active SW, and skipWaiting() is not
                        // called in the SW, then the user needs to close all their
                        // tabs before they'll get updates.
                        // todo show prompt for SW to activate sw immediately and reload page
                        logT('newSW installed!', forceUpdatePWA)
                        if (forceUpdatePWA) {
                           notify('info', 'new version will installed!')
                           updatePWA().then(() => {
                              notify('info', 'version updated!')
                           })
                        } else {
                           showNotifyNewVer(store)
                        }
                     } else {
                        // Otherwise, this newly installed SW will soon become the
                        // active SW. Rather than explicitly wait for that to happen,
                        // just show the initial "content is cached" message.
                        logT('SW installed first time! Content is cached! please wait...')
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
         const swShareStore = createStore('sw-share', 'request-formData')
         let shareData = await get('shareData', swShareStore)
         if (shareData) {
            // alert('share to Kalpagrama! shareData (see store.core.state.shareData)=\n' + JSON.stringify(shareData))
            await shareIn({ contentUrl: shareData.contentUrl })
            this.$logD('shareData=', shareData)
         } else next('/')
      } else next()
   })

   logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
   logT(f, 'start', registration)
   if (!registration) registration = await navigator.serviceWorker.register('/service-worker.js')
   const t1 = performance.now()
   if (registration && registration.waiting) { // если есть новый ожидающий SW - активируем его
      logT('registration.waiting.skipWaiting...')
      await new Promise((resolve, reject) => {
         registration.waiting.addEventListener('statechange', (event) => {
            // alert('registration.waiting statechange: ' + event.target.state)
            if (event.target.state === 'activated') {
               return resolve()
            }
         })
         registration.waiting.postMessage({ type: 'skipWaiting' })
      })
      logT('registration.waiting.skipWaiting OK!')
   }
   if (registration) {
      try {
         logT(f, 'try registration.unregister...')
         await registration.unregister()
         logT(f, 'registration.unregister success')
      } catch (err) {
         logE(f, 'registration.unregister err', err)
      }
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
   logT(f, 'try clear sw Idb')
   const swShareStore = createStore('sw-share', 'request-formData')
   const videoStore = createStore('sw-cache-video', 'video-responses')
   await clear(swShareStore)
   await clear(videoStore)
   logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

function showNotifyNewVer (store) {
   store.commit('core/stateSet', ['newVersionAvailable', true])
   Notify.create(
      {
         position: 'top',
         message: t('new_ver_avail', 'new version available'),
         actions: [{
            label: t('update_app', 'Update application'),
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
   await wait(2000)
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
            label: t('goto...', 'перейти...'),
            noDismiss: true,
            handler: async () => {
               await router.push(makeRoutePath(dbEvent.object))
            }
         }]
      }
   )
}

export { askForPwaWebPushPerm, initPWA, pwaReset, updatePWA, pwaShareWith }
