import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { Notify, Platform } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith } from 'src/system/pwa'
import assert from 'assert';
import i18next from 'i18next'
import { AuthApi } from 'src/api/auth'
import store from 'src/store/index'
import { wait } from 'src/system/utils'
import { router } from 'src/boot/main' // расширяет String и RegExp

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

function checkLocalStorage () {
   if (!localStorage.getItem('k_log_level') || !localStorage.getItem('k_log_filter') || !localStorage.getItem('k_debug')) resetLocalStorageData()
}

function resetLocalStorageData () {
   const f = resetLocalStorageData
   logD(f, 'start')
   for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i)
      if (process.env.NODE_ENV === 'development' && (key === 'k_debug' || key === 'k_log_level' || key === 'k_log_filter')) continue
      if (key === 'k_system_reset_date') continue
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

async function loginReset () {
   resetLocalStorageData()
   await store.dispatch('setCurrentUser', null)
   await rxdb.erase(false)
}

// очистить кэши и БД
async function systemReset (resetLocalStorage = false) {
   const f = systemReset
   logD(f, 'start')
   let currDate = Date.now()
   let lastResetDate = localStorage.getItem('k_system_reset_date')
   if (lastResetDate) {
      lastResetDate = parseInt(lastResetDate)
      if (currDate - lastResetDate < 1000 * 8) {
         logW('too often systemLogin. SLEEP for 5 sec!!!')
         await wait(1000 * 10) // защита от частого срабатывания
      }
   }
   localStorage.setItem('k_system_reset_date', currDate.toString())

   if (resetLocalStorage) resetLocalStorageData()
   const t1 = performance.now()
   if (process.env.MODE === 'pwa') await pwaReset()
   await rxdb.erase()
   await store.dispatch('setCurrentUser', null)
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

// если уже войдено - ничего не сделает (опирается на k_user_oid и k_token)
// если не войдено - попытается войти
async function systemLogin () {
   const f = systemLogin
   if (store.getters.currentUser()) return // уже войдено!
   logD(f, 'start')
   const t1 = performance.now()
   let userOid = localStorage.getItem('k_user_oid')
   try {
      if (userOid) { // пользователь зарегистрирован( уже вошел )
         await rxdb.init(userOid)
         let currentUser = await rxdb.get(RxCollectionEnum.OBJ, userOid)
         assert(currentUser, 'currentUser обязан быть после rxdb.init')
         await store.dispatch('setCurrentUser', currentUser)
         await i18next.changeLanguage(currentUser.profile.lang)
      } else { // пытаемся войти без логина
         if (!localStorage.getItem('k_token')) {
            const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
            if (needConfirm === false && dummyUser) {
               localStorage.setItem('k_dummy_user', JSON.stringify(dummyUser))
               await store.dispatch('setCurrentUser', dummyUser)
            }
         } else {
            let dummyUser = localStorage.getItem('k_dummy_user')
            if (dummyUser) {
               dummyUser = JSON.parse(dummyUser)
               await store.dispatch('setCurrentUser', dummyUser)
            }
         }
         if (store.getters.currentUser()) {
            await rxdb.init(null)
         }
      }
      if (!store.getters.currentUser()) { // не удалось залогиниться
         await systemReset(true)
         logD('GO LOGIN')
         await router.push('/auth')
         window.location.reload()
         return
      }
   } catch (err) {
      logE('error on systemLogin!', err)
      await systemReset(true)
      throw err
   }
   { // если зашли по ссылке поделиться(бэкенд редиректит в корень с query =  originalUrl)
      let originalUrl = localStorage.getItem('k_originalUrl') // переход на полную версию после ссылки "поделиться"
      if (originalUrl) {
         localStorage.removeItem('k_originalUrl')
         logD(f, 'redirect to ' + originalUrl)
         await router.push(originalUrl)
      }
   }
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

export { initServices, systemReset, shareWith, checkLocalStorage, systemLogin, loginReset }
