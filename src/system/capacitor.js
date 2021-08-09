import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { assert } from 'src/system/utils'
import { router } from 'src/boot/system'
import { HapticsImpactStyle, Plugins, StatusBarStyle } from '@capacitor/core'
// import { Screenshot } from 'com.darktalker.cordova.screenshot'
import { AuthApi } from 'src/api/auth'
import { makeRoutePath } from 'public/scripts/common_func'
import { shareIn } from 'src/system/services_browser'

const { PushNotifications, Share, App, StatusBar, Haptics, Browser } = Plugins

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.CP)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.CP)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.CP)

// let PushNotifications, Share
async function init (store) {
   App.addListener('appUrlOpen', async (openData) => {
      // alert('appUrlOpen: ' + JSON.stringify(openData))
      logD('appUrlOpen. openData=', openData)
      let url = new URL(openData.url)
      let data = url.searchParams.get('data')
      let contentUrl = url.searchParams.get('contentUrl')
      let contentText = url.searchParams.get('contentText')

      let userId = url.searchParams.get('userId')
      let loginType = url.searchParams.get('loginType')
      let userExist = url.searchParams.get('userExist')
      let needInvite = url.searchParams.get('needInvite')
      let needConfirm = url.searchParams.get('needConfirm')
      let token = url.searchParams.get('token')
      let expires = url.searchParams.get('expires')
      if (contentUrl || contentText) { // поделиться в приложение (вариант для ios и android)
         // alert('appUrlOpen. contentUrl = ' + contentUrl)
         // alert('appUrlOpen. contentText = ' + contentText)
         await shareIn({ contentUrl })
      } else if (userId) {
         // alert('appUrlOpen... /auth/sign-in auth.userId = ' + userId)
         await router.push({
            path: '/auth/sign-in',
            query: { userId, loginType, userExist, needInvite, needConfirm, token, expires }
         })
      } else { // deep linking
         // alert(`appUrlOpen deep linking... data.url1= ${url}`)
         // Example url: https://dev.kalpa.app/content/23874628346781637
         // path = /content/23874628346781637
         const path = url.toString().split('.app').pop()
         // alert('appUrlOpen deep linking... path= ' + path)
         // We only push to the route if there is a path present
         if (path) {
            router.push({ path })
         }
      }
   })
   await orientationLock('portrait')
   await statusBarSetStyle('dark')
   await statusBarSetVisible(false)
   // Events (iOS only)
   // window.addEventListener('statusTap', function () {
   //    // alert('statusbar tapped')
   // })
}

async function statusBarSetVisible (visible) {
   if (visible) await StatusBar.show()
   else await StatusBar.hide()
}

async function statusBarSetStyle (style) {
   assert(style.in('dark', 'light'), 'bad style')
   if (style === 'dark') style = StatusBarStyle.Dark
   else style = StatusBarStyle.Light
   await StatusBar.setStyle({ style })
}

async function vibrate () {
   // assert(pattern && Array.isArray(pattern), 'pattern && Array.isArray(pattern)')
   Haptics.vibrate()
}

async function hapticsImpact (style) {
   assert(style.in('medium', 'heavy', 'light'), '!style.in(medium, heavy, light)')
   if (style === 'medium') style = HapticsImpactStyle.Medium
   else if (style === 'heavy') style = HapticsImpactStyle.Heavy
   else if (style === 'light') style = HapticsImpactStyle.Light
   Haptics.impact({ style });
}

async function initPushPlugin (store) {
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
         // alert('Push dbEvent received (app is opened):' + JSON.stringify(notification))
         let dbEvent = JSON.parse(notification.notification.data.event || '{}')
         // alert('Push dbEvent received (app is opened):' + JSON.stringify(dbEvent))
         let route = (makeRoutePath(dbEvent.object) || '/').replaceAll('//', '/')
         // alert('route = ' + route)
         await router.push(route)
      }
   )

   // Method called when tapping on a notification
   PushNotifications.addListener('pushNotificationActionPerformed', async (notification) => {
         logD('Push action performed: ', notification)
         // alert('Push action performed:' + JSON.stringify(notification))
         let dbEvent = JSON.parse(notification.notification.data.event || '{}')
         // alert('Push action performed:' + JSON.stringify(dbEvent))
         let route = (makeRoutePath(dbEvent.object) || '/').replaceAll('//', '/')
         // alert('route = ' + route)
         await router.push(route)
      }
   )
}

async function shareOut (title, text, url) {
   assert(Share)
   let shareRet = await Share.share({ title, text, url, dialogTitle: 'kalpagrama share' })
}

async function orientationLock (mode) {
   assert(mode.in('portrait', 'landscape', 'default'))
   if (mode === 'default') await window.screen.orientation.unlock();
   else await window.screen.orientation.lock(mode);
}

Browser.addListener('browserFinished', (info) => {
   // alert('browserFinished' + JSON.stringify(info))
})
Browser.addListener('browserPageLoaded', async (info) => {
   // alert('browserPageLoaded' + JSON.stringify(info))
})

async function openUrl (urlStr) {
   await Browser.open({ url: urlStr, presentationStyle: 'fullscreen' })
}

async function screenshot () {
   alert('screenshot')
   navigator.screenshot.URI(function (error, res) {
      if (error) {
         alert(JSON.stringify(error))
         console.error(error);
      } else {
         console.error('ОК!', res.URI)
         alert('OK:' + JSON.stringify(res))
      }
   }, 50);

   navigator.screenshot.save(function (error, res) {
      if (error) {
         console.error(error);
      } else {
         alert('ok' + res.filePath); // should be path/to/myScreenshot.jpg
      }
   }, 'jpg', 50, 'myScreenShot');
}

export {
   init,
   initPushPlugin,
   shareOut,
   orientationLock,
   statusBarSetVisible,
   statusBarSetStyle,
   vibrate,
   hapticsImpact,
   openUrl,
   screenshot
}
