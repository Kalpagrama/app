import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { Notify, Platform } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith } from 'src/system/pwa'
import assert from 'assert';
import i18next from 'i18next'
import { AuthApi } from 'src/api/auth'
import store from 'src/store/index'
import utils from 'src/system/utils' // расширяет String и RegExp
utils()

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SYSTEM)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SYSTEM)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SYSTEM)

async function initServices (store) {
   const f = initServices
   logD(f, 'start', Platform.is, process.env.MODE)
   const t1 = performance.now()
   if (process.env.MODE === 'pwa') {
      await initPWA(store)
   } else if (Platform.is.capacitor) {
      const { initCapacitor } = await import('src/system/capacitor.js')
      await initCapacitor(store)
   } else if (Platform.is.cordova) {
      const { initCordova } = await import('src/system/cordova.js')
      await initCordova(store)
   }
   initOfflineEvents(store)
   // todo запрашивать тольько когда юзер первый раз ставит приложение и из настроек!!!
   const hasPerm = await askForWebPushPerm(store)
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, hasPerm)
}

async function shareWith (object) {
   const f = shareWith
   logD(f, 'start', Platform.is, process.env.MODE)
   const t1 = performance.now()
   let title, text, url
   assert(object && object.oid && object.type)
   switch (object.type) {
      case 'NODE':
         title = object.name
         text = object.name
         url = location.origin + '/node/' + object.oid
         break
      case 'USER':
         title = object.name
         text = object.name
         url = location.origin + '/user/' + object.oid
   }
   if (process.env.MODE === 'pwa' || process.env.MODE === 'spa') {
      if (url) await pwaShareWith(title, text, url)
   }
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

async function askForWebPushPerm (store) {
   if (Platform.is.capacitor) {
      const { initCapacitorPushPlugin } = await import('src/system/capacitor.js')
      await initCapacitorPushPlugin(store)
      return true
   } else if (Platform.is.cordova) {
      const { initCordovaPushPlugin } = await import('src/system/cordova.js')
      await initCordovaPushPlugin(store)
      return true
   } else if (process.env.MODE === 'pwa') {
      return await askForPwaWebPushPerm(store)
   }
}

function initOfflineEvents (store) {
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
}

function resetLocalStorageData () {
   const f = resetLocalStorageData
   logD(f, 'start')
   for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i)
      if (process.env.NODE_ENV === 'development' && (key === 'k_debug' || key === 'k_log_level' || key === 'k_log_filter' || key === 'k_login_date')) continue
      if (key === 'k_originalUrl') continue
      if (key.startsWith('k_')) localStorage.removeItem(key)
   }
   if (!localStorage.getItem('k_debug')) localStorage.setItem('k_debug', '0')
   if (!localStorage.getItem('k_log_level')) {
      if (process.env.NODE_ENV === 'development') localStorage.setItem('k_log_level', LogLevelEnum.DEBUG)
      else localStorage.setItem('k_log_level', LogLevelEnum.WARNING)
   }
   if (!localStorage.getItem('k_log_filter')) localStorage.setItem('k_log_filter', 'gui')
}

function checkLocalStorage () {
   if (!localStorage.getItem('k_log_level') || !localStorage.getItem('k_log_filter') || !localStorage.getItem('k_debug')) resetLocalStorageData()
}

// очистить кэши и БД
async function systemReset (resetLocalStorage = false) {
   const f = systemReset
   logD(f, 'start')
   if (resetLocalStorage) resetLocalStorageData()
   const t1 = performance.now()
   if (process.env.MODE === 'pwa') await pwaReset()
   await rxdb.clearAll()
   await rxdb.deinit()
   await store.dispatch('setCurrentUser', null)
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

// async function systemInit (store) {
//    const f = systemInit
//    logD(f, 'start')
//    const t1 = performance.now()
//    let userOid = localStorage.getItem('k_user_oid')
//    if (userOid) { // пользователь зарегестрирован
//       try {
//          await rxdb.init(userOid)
//          let currentUser = await rxdb.get(RxCollectionEnum.OBJ, userOid)
//          assert(currentUser, 'currentUser обязан быть после rxdb.init')
//          // logD(f, 'currentUser= ', currentUser)
//          await store.dispatch('init', currentUser)
//          await i18next.changeLanguage(currentUser.profile.lang)
//       } catch (err) {
//          logE('error on systemInit!', err)
//          await systemReset(true)
//          throw err
//       }
//    } else { // пытаемсся войти без логина
//       try {
//          if (!localStorage.getItem('k_token')) {
//             const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
//             if (needConfirm === false && dummyUser) {
//                localStorage.setItem('k_dummy_user', JSON.stringify(dummyUser))
//                await store.dispatch('init', dummyUser)
//             }
//          } else {
//             let dummyUser = localStorage.getItem('k_dummy_user')
//             if (dummyUser) {
//                dummyUser = JSON.parse(dummyUser)
//                await store.dispatch('init', dummyUser)
//             }
//          }
//          if (store.getters.currentUser()) {
//             await rxdb.init(null)
//          }
//       } catch (err) {
//          logE('error on systemInit!', err)
//          await systemReset(true)
//          throw err
//       }
//    }
//    if (!store.getters.currentUser()) {
//       await systemReset(true)
//    }
//
//    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
// }

export { initServices, systemReset, shareWith, checkLocalStorage }
