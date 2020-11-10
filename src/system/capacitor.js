import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import assert from 'assert'
import { router } from 'src/boot/system'
import { Plugins, StatusBarStyle } from '@capacitor/core'
import { AuthApi } from 'src/api/auth'
import { makeRoutePath } from 'public/scripts/common_func'

const { PushNotifications, Share, App, StatusBar } = Plugins

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.CP)

// let PushNotifications, Share
async function initCapacitor (store) {
   // share для ios (не разобрался как из ios послать эвент в js без плагина)
   // alert(JSON.stringify(Platform.is))
   App.addListener('appUrlOpen', async (openData) => {
      // alert('appUrlOpen: ' + JSON.stringify(openData))
      logD('appUrlOpen. openData=', openData)
      let url = new URL(openData.url)
      let data = url.searchParams.get('data')
      let text = url.searchParams.get('contentText')

      let userId = url.searchParams.get('userId')
      let loginType = url.searchParams.get('loginType')
      let userExist = url.searchParams.get('userExist')
      let needInvite = url.searchParams.get('needInvite')
      let needConfirm = url.searchParams.get('needConfirm')
      let token = url.searchParams.get('token')
      let expires = url.searchParams.get('expires')
      if (data || text) {
         // alert('appUrlOpen. data = ' + data)
         // alert('appUrlOpen. text = ' + text)
         let shareItem = {
            type: 'VIDEO',
            url: text,
            file: null
         }
         // alert('shareItem = ' + JSON.stringify(shareItem))
         store.commit('workspace/stateSet', ['shareItem', shareItem], { root: true })
         await router.push({ path: '/workspace/contentNotes', query: { share: true } })
      } else if (userId) {
         // alert('appUrlOpen... /auth/sign-in auth.userId = ' + userId)
         await router.push({
            path: '/auth/sign-in',
            query: { userId, loginType, userExist, needInvite, needConfirm, token, expires }
         })
      } else { // deep linking
         // Example url: https://dev.kalpa.app/content/23874628346781637
         // slug = /content/23874628346781637
         const slug = data.url.split('.app').pop()
         // We only push to the route if there is a slug present
         if (slug) {
            router.push({
               path: slug
            })
         }
      }
   })
   // share для android
   window.addEventListener('shareEventKalpa', async (e) => {
      // Prevent the mini-info bar from appearing.
      alert('shareEventKalpa !' + JSON.stringify(e))
      let shareItem = {
         type: 'VIDEO',
         url: e.dataKey,
         file: null
      }
      alert('shareItem = ' + JSON.stringify(shareItem))
      store.commit('workspace/stateSet', ['shareItem', shareItem], { root: true })
      await router.push({ path: '/workspace/contentNotes', query: { share: true } })
   })
   await capacitorOrientationLock('portrait')
   // Events (iOS only)
   window.addEventListener('statusTap', function () {
      // alert('statusbar tapped')
   })
   await StatusBar.setStyle({
      style: StatusBarStyle.Dark,
      overlays: true
   })
   // await StatusBar.hide()
}

async function capacitorShowStatusBar () {
   await StatusBar.show()
}

async function capacitorHideStatusBar () {
   await StatusBar.hide()
}

async function initCapacitorPushPlugin (store) {
   assert(PushNotifications)
   // Request permission to use push notifications
   // iOS will prompt user and return if they granted permission or not
   // Android will just grant without prompting
   let result = await PushNotifications.requestPermission()
   if (result.granted) {
      // Register with Apple / Google to receive push via APNS/FCM
      PushNotifications.register()
   } else {
      alert('Push registration ERROR:')
      logE('Push registration ERROR:', result)
   }

   // On success, we should be able to receive notifications
   PushNotifications.addListener('registration', (token) => {
         // alert('Push registration success, token: ' + token.value)
         logD('Push registration success, token: ' + token.value)
         AuthApi.setWebPushToken(token.value).catch(err => logE(err))
      }
   )

   // Some issue with our setup and push will not work
   PushNotifications.addListener('registrationError', (error) => {
         alert('Error on push registration:')
         logE('Error on push registration: ', error)
      }
   )

   // Show us the notification payload if the app is open on our device
   PushNotifications.addListener('pushNotificationReceived', async (notification) => {
         logD('Push received (app is opened): ', notification)
         alert('Push dbEvent received (app is opened):' + JSON.stringify(notification))
         let dbEvent = JSON.parse(notification.notification.data.event || '{}')
         alert('Push dbEvent received (app is opened):' + JSON.stringify(dbEvent))
         let route = (makeRoutePath(dbEvent.object) || '/').replaceAll('//', '/')
         alert('route = ' + route)
         await router.push(route)
      }
   )

   // Method called when tapping on a notification
   PushNotifications.addListener('pushNotificationActionPerformed', async (notification) => {
         logD('Push action performed: ', notification)
         alert('Push action performed:' + JSON.stringify(notification))
         let dbEvent = JSON.parse(notification.notification.data.event || '{}')
         alert('Push action performed:' + JSON.stringify(dbEvent))
         let route = (makeRoutePath(dbEvent.object) || '/').replaceAll('//', '/')
         alert('route = ' + route)
         await router.push(route)
      }
   )
}

async function capacitorShowShareDialog () {
   assert(Share)
   let shareRet = await Share.share({
      title: 'title kalpagrama share data',
      text: 'text kalpagrama share data',
      url: 'https://kalpa.app/#OID',
      dialogTitle: 'dialogTitle kalpagrama share' // Android only
   })
}

async function capacitorOrientationLock (mode) {
   assert(mode.in('portrait', 'landscape', 'default'))
   if (mode === 'default') await window.screen.orientation.unlock();
   else await window.screen.orientation.lock(mode);
}

export {
   initCapacitor,
   initCapacitorPushPlugin,
   capacitorOrientationLock,
   capacitorShowStatusBar,
   capacitorHideStatusBar
}
