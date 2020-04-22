import { Store, get, clear } from 'src/statics/scripts/idb-keyval/idb-keyval.mjs'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Notify, Platform } from 'quasar'
import { i18n } from 'boot/i18n'
import { capacitorInit } from 'src/system/capacitor'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.SW)

let registration = null // ServiceWorkerRegistration
let messaging = null
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function sendMessageToSW (message) {
  // This wraps the message posting/response in a promise, which will
  // resolve if the response doesn't contain an error, and reject with
  // the error if it does. If you'd prefer, it's possible to call
  // controller.postMessage() and set up the onmessage handler
  // independently of a promise, but this is a convenient wrapper.
  return new Promise(function (resolve, reject) {
    var messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }
    // This sends the message data as well as transferring
    // messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply
    // via postMessage(), which will in turn trigger the onmessage
    // handler on messageChannel.port1.
    // See
    // https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage
    if (navigator && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2])
    } else {
      reject('no controller!!!')
    }
  })
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
          await update()
        }
      }]
    }
  )
}

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
    // init sw
    {
      logD('try navigator.serviceWorker.register service-worker.js')
      registration = await navigator.serviceWorker.register('/service-worker.js')
      logD('Registration sw succeeded. Scope is ', registration.scope)

      wait(100).then(() => {
        logD('sendMessageToSW...')
        sendMessageToSW({
          type: 'logInit',
          logModulesBlackList: store.state.core.logModulesBlackList,
          logLevel: store.state.core.logLevel,
          logLevelSentry: store.state.core.logLevelSentry
        }).catch(err => logE('cant post msg to sw', err))
      })
      if (registration.waiting && registration.active) {
        // The page has been loaded when there's already a waiting and active SW.
        // This would happen if skipWaiting isn't being called, and there are
        // still old tabs open.
        logW('Please close all tabs to get updates.')
        // todo show prompt for SW to activate sw immediately and reload page
        registration.waiting.postMessage({ type: 'skipWaiting' })
        store.commit('core/stateSet', ['newVersionAvailable', true])
        await clearCache()
      } else {
        // updatefound is also fired for the very first install. ¯\_(ツ)_/¯
        registration.addEventListener('updatefound', () => {
          // If updatefound is fired, it means that there's
          // a new service worker being installed.
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
                showNotifyNewVer()
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
      { // получаем версию текущего sw (просим сервисворкнра записать ее в iDb)
        navigator.serviceWorker.addEventListener('message', function handler (event) {
          let eventData = event.data
          if (eventData.firebaseMessaging) {
            logD('web push message recieved!', eventData.firebaseMessaging.payload.data)
            const notificationTitle = `${eventData.firebaseMessaging.payload.data.type} event received!`
            showNotification(notificationTitle, 'body')
          } else if (eventData.type === 'swVer') {
            logD('sw version =', eventData.msgData)
            store.commit('core/stateSet', ['version', `${store.state.core.version}-${eventData.msgData}`])
          } else if (eventData.type === 'webPushToken') {
            logD('webPushToken =', eventData.msgData)
            // store.dispatch('core/setWebPushToken', eventData.msgData) нельзя вызывать тк аполло еше не инициализирован
            store.commit('core/stateSet', ['webPushTokenDraft', eventData.msgData])
          } else {
            logD('sw unknown message recieved!', eventData)
          }
        })
        if (registration.active) {
          registration.active.postMessage({ type: 'sendVersion' })
          registration.active.postMessage({ type: 'sendWebPushToken' })
        }
      }
    }
    logD('initSw complete')
    // await initWebPush(store)
  } else logW('serviceWorker disabled!')

  function handleNetworkChange (event) {
    logD('handleNetworkChange', navigator.onLine)
    store.commit('core/stateSet', ['online', navigator.onLine])
    Notify.create(
      {
        position: 'top',
        message: store.state.core.online
          ? i18n.t('network_available', 'network available') : i18n.t('network_unavailable', 'network unavailable')
      }
    )
  }

  window.addEventListener('online', handleNetworkChange)
  window.addEventListener('offline', handleNetworkChange)
  store.commit('core/stateSet', ['online', navigator.onLine])
  const hasPerm = await askForWebPushPerm(store) // todo запрашивать тольько когда юзер первый раз ставит приложение и из настроек!!!
  logD('initSw OK! notification permission = ', hasPerm)
}

// очистить кэш сервис-воркера + vuexPersistStore
async function clearCache (force = false) {
  logD('clearCache start')
  if (registration && registration.waiting) { // если есть новый ожидающий SW - активируем его
    registration.waiting.postMessage({ type: 'skipWaiting' })
  }
  if (registration) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => { // прекэш сам обновляется( + у файлов уникальный префикс). Если удалить, то в след раз он заполнится только при инсталляции воркера!
        if (force || !cacheName.startsWith('kalpa-precache')) {
          logD('clear cacheDb. cacheName=', cacheName)
          caches.delete(cacheName)
          logD('clear cacheDb. Ok!', cacheName)
        }
      })
    })
  }
  logD('clear Idb...')
  const swShareStore = new Store('sw-share', 'request-formData')
  const videoStore = new Store('sw-cache-video', 'video-responses')
  const vuexPersistStore = new Store('vuexPersistStore', 'cache')
  await clear(swShareStore)
  await clear(vuexPersistStore)
  await clear(videoStore)
  logD('clearCache end!')
}

// async function initWebPush (store) {
//   logD('initWebPush start')
//   if ('safari' in window && 'pushNotification' in window.safari) { // APNS
//     // let permissionData = window.safari.pushNotification.permission('mac.kalpagramma.com')
//     // checkSafariRemotePermission(permissionData, store)
//   } else { // FCM
//     const hasPerm = await askForWebPushPerm(store)
//     if (!hasPerm) {
//       logD('Notification permission denied!')
//       return
//     }
//     if (firebase.messaging.isSupported() && registration && !messaging) {
//       firebase.initializeApp({
//         apiKey: 'AIzaSyAznncIqhrqA35A3yBQkTnxyNGI45sxeNk',
//         authDomain: 'kalpagramma-7a913.firebaseapp.com',
//         databaseURL: 'https://kalpagramma-7a913.firebaseio.com',
//         projectId: 'kalpagramma-7a913',
//         storageBucket: 'kalpagramma-7a913.appspot.com',
//         messagingSenderId: '1082935232322',
//         appId: '1:1082935232322:web:a4f0203aa4015e8f86eadb',
//         measurementId: 'G-D8QZ67XLM5'
//       })
//       messaging = firebase.messaging()
//       messaging.useServiceWorker(registration)
//       // - a message is received while the app has focus
//       messaging.onMessage((payload) => {
//         logD('Message received . ', payload)
//         // ...
//       })
//       let token = await messaging.getToken()
//       store.commit('core/stateSet', ['webPushTokenDraft', token])
//       await showNotification('application loaded', `version=${store.state.core.version}`)
//       // todo send to server
//       messaging.onTokenRefresh(async () => {
//         let token = await messaging.getToken()
//         await store.dispatch('core/setWebPushToken', token)
//       })
//       return token
//     }
//   }
//   logD('initWebPush end')
// }

async function checkUpdate () {
  logD('checkUpdate1')
  if (registration) {
    logD('checkUpdate2')
    await registration.update()
  }
}

async function update () {
  await clearCache()
  await window.location.reload()
}

async function askForWebPushPerm (store) {
  if (Platform.is.capacitor) {
    await capacitorInit()
    return true
  } else {
    return new Promise((resolve, reject) => {
      if (Platform.is.safari && !Platform.is.ios) {
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
      }
    })
  }
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
    vibrate: [500, 100, 500],
    tag: 'tag: sample'
  }
  // let notification = new Notification('direct:' + title, options)
  // logD('notification=', notifications)

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

export { initSw, checkUpdate, update, clearCache }
