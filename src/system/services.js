import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { AppVisibility, Notify, Platform } from 'quasar'
import Vue from 'vue'
import { i18n } from 'src/boot/i18n'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith } from 'src/system/pwa'
import assert from 'assert';
import i18next from 'i18next'
import { AuthApi } from 'src/api/auth'
import store from 'src/store/index'
import { wait } from 'src/system/utils'
import { router } from 'src/boot/main'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SYSTEM)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SYSTEM)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SYSTEM)

let initialized = false
let setLeader = () => {
   logD('change leader to ', getInstanceId())
   localStorage.setItem('k_leader_instance_id', getInstanceId())
}
let isLeader = () => {
   let currentLeaderInstanceId = localStorage.getItem('k_leader_instance_id')
   if (!currentLeaderInstanceId) {
      setLeader()
      currentLeaderInstanceId = getInstanceId()
   }
   return currentLeaderInstanceId === getInstanceId()
}

// синхронизация вкладок (globalLock следит за синхронизацией ws, очисткой rxdb, и др)
const maxLockTimeFuse = 1000 * 60 // считаем что операция не может быть дольше минуты
let globalLock = async (recursive = true) => {
   const f = globalLock
   logD(f, 'start')
   const t1 = performance.now()
   let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
   assert('dt' in current && 'instanceId' in current)
   if (!recursive || getInstanceId() !== current.instanceId) {
      while (Date.now() - current.dt > 0 && Date.now() - current.dt < maxLockTimeFuse) {
         await wait(100)
         if (Date.now() % 10 === 0) logD(f, `wait for release. ${Math.ceil((Date.now() - current.dt) / 1000)} sec left`)
      }
   }
   localStorage.setItem('k_global_lock', JSON.stringify({ dt: Date.now(), instanceId: getInstanceId() }))
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}
let globalRelease = () => {
   const f = globalRelease
   let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
   assert('dt' in current && 'instanceId' in current)
   if (current.instanceId === getInstanceId()) {
      localStorage.removeItem('k_global_lock')
   } else if (current.instanceId) logW(f, `other instance (${current.instanceId}) lock while work is not complete. maybe work is too heavy`) // такое возможно из-за maxLockTimeFuse
}

const instanceId = sessionStorage.getItem('k_instance_id') ? sessionStorage.getItem('k_instance_id') : (Math.ceil(Math.random() * Date.now())).toString()
sessionStorage.removeItem('k_instance_id') // контроль дублирования (при удблированиии вкладок дублируется sessionStorage) https://stackoverflow.com/questions/11896160/any-way-to-identify-browser-tab-in-javascript
window.addEventListener('beforeunload', () => {
   sessionStorage.setItem('k_instance_id', instanceId)
})

function getInstanceId () {
   return instanceId
}

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
   let timerId
   // подписываемся на добавление localStorage (Событие не работает на вкладке, которая вносит изменения)
   // window.addEventListener('storage', async function (event) {
   //    // logD('storage event:', event)
   //    if (event.key.in('k_dummy_user', 'k_user_oid')) {
   //       logD('storage auth event:', event)
   //       if (event.newValue){
   //          await wait(2000) // даем время инициатору первым перейти и инициализировать rxdb
   //          await router.replace('/home')
   //          await wait(2000) // даем время инициатору первым перейти и инициализировать rxdb
   //          await window.location.reload()
   //       } else {
   //          await wait(2000) // даем время инициатору первым перейти и очистить rxdb
   //          await router.replace('/auth')
   //          // await window.location.reload()
   //       }
   //    }
   // })
   window.addEventListener('storage', async function (event) {
      if (event.key.in('k_system_reset_date', 'k_dummy_user', 'k_user_oid')) { // одна из вкладок выполнила systemReset либо вход
         logD('localStorage event:', event)
         if (timerId) clearTimeout(timerId)
         timerId = setTimeout(async () => { // даем время инициатору 1 сек привести localstorage в согласованное состояние
            logD('localStorage event2:', localStorage.getItem('k_user_oid'), localStorage.getItem('k_dummy_user'), localStorage.getItem('k_token'))
            if (localStorage.getItem('k_user_oid') || localStorage.getItem('k_dummy_user')) await router.replace('/home')
            else await router.replace('/auth')
            // window.location.reload()
         }, 1000)
      }
   })
   // leader detection
   {
      // отслеживание открыта ли вкладка
      this.vm = new Vue({
         data: {
            appVisibility: AppVisibility
         },
         watch: {
            appVisibility: {
               deep: true,
               immediate: true,
               async handler (to, from) {
                  assert(to, '!to!')
                  // logD(`appVisibility changed! from:${from ? from.appVisible : false} to: ${to.appVisible}`)
                  if (to && to.appVisible && !isLeader()) setLeader()
               }
            }
         }
      })
   }

   initialized = true
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

async function initLocalStorage () {
   if (!localStorage.getItem('k_log_level') || !localStorage.getItem('k_log_filter') || !localStorage.getItem('k_debug')) await resetLocalStorage()
}

async function resetLocalStorage () {
   const f = resetLocalStorage
   logD(f, 'start')
   try {
      await globalLock()
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
   } finally {
      globalRelease()
   }
}

// очистить кэши и БД
// todo если systemReset не помогает вызывается слишком часто - во второй попробовать hardReset
async function systemReset (clearAuthData = false, clearRxdbWs = true, clearRxdbCache = true, reload = true) {
   const f = systemReset
   const t1 = performance.now()
   logD(f, 'start')
   // let hardReset = confirm('critical error on startup: ' + JSON.stringify(err) + '\n\nMake hardReset?')
   // if (hardReset) {
   //   const { systemHardReset } = require('src/system/services')
   //   await systemHardReset()
   //   window.location.reload()
   // }
   let currDate = Date.now()
   try {
      await globalLock()
      let lastResetDate = localStorage.getItem('k_system_reset_date')
      if (lastResetDate) {
         lastResetDate = parseInt(lastResetDate)
         if (currDate - lastResetDate < 1000 * 8) {
            let waitTime = Math.max(1000 * 8 - Math.max(currDate - lastResetDate, 0), 0)
            logW(`too often systemReset. SLEEP for ${waitTime / 1000} sec!!!`)
            await wait(waitTime) // защита от частого срабатывания
         }
      }
      if (clearAuthData) await resetLocalStorage()
      if (clearRxdbWs || clearRxdbCache) {
         await rxdb.deinit(clearRxdbCache)
      }
      if (process.env.MODE === 'pwa') await pwaReset()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      let hardReset = confirm('critical error on systemReset: ' + JSON.stringify(err) + '\n\n Make hardReset?')
      if (hardReset) {
        await systemHardReset()
        window.location.reload()
      }
   } finally {
      globalRelease()
      localStorage.setItem('k_system_reset_date', currDate.toString())
      if (reload) window.location.reload()
   }
}

// если уже войдено - ничего не сделает (опирается на k_user_oid и k_token)
// если не войдено - попытается войти
async function systemInit () {
   const f = systemInit
   logD(f, 'start')
   const t1 = performance.now()
   if (rxdb.isInitialized()) {
      logD(f, 'skip systemInit')
      return
   } // уже войдено!
   try {
      await globalLock()
      let userOid = localStorage.getItem('k_user_oid')
      let currentUser
      if (userOid) { // пользователь зарегистрирован
         await rxdb.init({userOid})
         currentUser = await rxdb.get(RxCollectionEnum.OBJ, userOid)
         assert(currentUser, 'currentUser обязан быть после rxdb.init')
      } else { // пытаемся войти без регистрации
         if (!localStorage.getItem('k_token')) {
            const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
            logD('userIdentify = ', { userExist, userId, needInvite, needConfirm, dummyUser, loginType })
            if (needConfirm === false && dummyUser) {
               localStorage.setItem('k_dummy_user', JSON.stringify(dummyUser))
               currentUser = dummyUser
            }
         } else if (localStorage.getItem('k_dummy_user')) {
            currentUser = JSON.parse(localStorage.getItem('k_dummy_user'))
         }
         if (currentUser) {
            await rxdb.init({dummyUser: currentUser})
         }
      }
      if (rxdb.isInitialized()) {
         await i18next.changeLanguage(currentUser.profile.lang)
         if (localStorage.getItem('k_originalUrl')) { // если зашли по ссылке поделиться(бэкенд редиректит в корень с query =  originalUrl)
            localStorage.removeItem('k_originalUrl')
            logD(f, 'redirect to originalUrl: ' + localStorage.getItem('k_originalUrl'))
            await router.replace(localStorage.getItem('k_originalUrl'))
         }
      } else { // не удалось залогиниться
         logD(f, 'GO LOGIN')
         await resetLocalStorage()
         await router.replace('/auth')
      }
   } catch (err) {
      logE('error on systemInit!', err)
      await systemReset(true, true, true)
      throw err
   } finally {
      globalRelease()
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }
}

async function systemHardReset () {
   if (window.indexedDB) {
      if (window.indexedDB.databases) {
         let dbs = await window.indexedDB.databases()
         for (let db of dbs) {
            logD('indexedDB.deleteDatabase(databaseName): ' + db.name)
            window.indexedDB.deleteDatabase(db.name)
         }
      } else {
         for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i)
            if (key.startsWith('_pouch_rxdb')) {
               logD('indexedDB.deleteDatabase(databaseName): ' + key)
               window.indexedDB.deleteDatabase(key)
            }
         }
      }
   } else window.alert('Ваш браузер не поддерживат стабильную версию IndexedDB.')
   if (process.env.MODE === 'pwa') await pwaReset()
   localStorage.clear()
   logD('systemHardReset complete')
   setTimeout(() => window.location.reload(), 5000)
}

export {
   getInstanceId,
   isLeader,
   globalLock,
   globalRelease,
   initServices,
   systemReset,
   shareWith,
   initLocalStorage,
   systemInit
}
