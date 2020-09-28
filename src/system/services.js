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
import { Mutex } from 'src/system/rxdb/reactive'

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
   // logD(f, 'start', getInstanceId())
   const t1 = performance.now()
   let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
   if (!recursive || getInstanceId() !== current.instanceId) {
      while (Date.now() - current.dt > 0 && Date.now() - current.dt < maxLockTimeFuse) {
         assert('dt' in current && 'instanceId' in current, 'bad current!')
         await wait(100)
         if (Date.now() % 10 === 0) logD(f, `wait for globalLock release(${JSON.stringify(current)}). MyInstanceId=${getInstanceId()}. ${Math.ceil((Date.now() - current.dt) / 1000)} sec left`)
         current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
      }
      if (current.dt) logW('break globalLock by timeout(maxLockTimeFuse)!', current)
   }
   localStorage.setItem('k_global_lock', JSON.stringify({ dt: Date.now(), instanceId: getInstanceId() }))
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, getInstanceId())
}
let globalRelease = () => {
   const f = globalRelease
   let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
   // logD(f, 'start', getInstanceId(), current)
   assert('dt' in current && 'instanceId' in current)
   if (current.instanceId === getInstanceId()) {
      localStorage.removeItem('k_global_lock')
   } else if (current.instanceId) logW(f, `cancel foreign(external) globalLock  (${current.instanceId}) lock while work is not complete. maybe work is too heavy`) // такое возможно из-за maxLockTimeFuse
}
// let globalLockedByMe = () => {
//    let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
//    return current.instanceId === getInstanceId()
// }

const instanceId = sessionStorage.getItem('k_instance_id') ? sessionStorage.getItem('k_instance_id') : (Math.ceil(Math.random() * Date.now())).toString()
sessionStorage.removeItem('k_instance_id') // контроль дублирования (при удблированиии вкладок дублируется sessionStorage) https://stackoverflow.com/questions/11896160/any-way-to-identify-browser-tab-in-javascript
window.addEventListener('beforeunload', () => {
   logD('on page unload')
   sessionStorage.setItem('k_instance_id', instanceId) // запоминаем instanceId (хранится в сторадж только тогда когда вкладка закрыта (иначе при дублировании вкладки - дублируется и instanceId))
   let currentLock = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
   if (currentLock.instanceId === getInstanceId()) {
      localStorage.removeItem('k_global_lock') // если что то блокировали - снимаем блокировку
   }
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
   let storageEventMutex = new Mutex()
   // подписываемся на изменение localStorage (Событие НЕ работает на вкладке, которая вносит изменения)
   window.addEventListener('storage', async function (event) {
      try {
         await storageEventMutex.lock()// события валятся параллельно (второе приходит не дожидаясь выполнения первого)
         // одна из вкладок выполнила либо вход либо выход
         if (event.key && event.key.in('k_login_date', 'k_logout_date') && event.newValue) {
            logD(`localStorage auth event: ${event.key}`, event)
            if (event.key === 'k_login_date') await router.replace('/home')
            else await router.replace('/auth')
         }
         await rxdb.processStoreEvent(event)
      } finally {
         storageEventMutex.release()
      }
   })
   // leader detection
   {
      // отслеживание открыта ли вкладка
      let vm = new Vue({
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

async function initSessionStorage () {
   if (!sessionStorage.getItem('k_debug')) sessionStorage.setItem('k_debug', '0')
   if (!sessionStorage.getItem('k_log_level')) {
      if (process.env.NODE_ENV === 'development') sessionStorage.setItem('k_log_level', LogLevelEnum.DEBUG)
      else sessionStorage.setItem('k_log_level', LogLevelEnum.WARNING)
   }
   if (!sessionStorage.getItem('k_log_filter')) sessionStorage.setItem('k_log_filter', 'gui')
}

async function resetLocalStorage () {
   const f = resetLocalStorage
   logD(f, 'start')
   try {
      await globalLock()
      for (let i = 0; i < localStorage.length; i++) {
         let key = localStorage.key(i)
         if (key.startsWith('k_')) localStorage.removeItem(key)
      }
   } finally {
      globalRelease()
   }
}

// очистить кэши и БД
// todo если systemReset не помогает вызывается слишком часто - во второй попробовать hardReset
async function systemReset (clearAuthData = false, clearRxdb = true, reload = true) {
   const f = systemReset
   const t1 = performance.now()
   logD(f, 'start')
   let resetDates = JSON.parse(sessionStorage.getItem('k_system_reset_dates') || '[]')
   resetDates = resetDates.filter(dt => Date.now() - dt < 1000 * 60) // удаляем все что старше минуты
   try {
      await globalLock()
      if (resetDates.length > 5) { // за последнюю минуту произошло слишком много systemReset
         logW('too often systemReset!')
         let hardReset = confirm('Too often system reset. \n Make app hard reset?')
         if (hardReset) {
           await systemHardReset()
           window.location.reload()
         }
      }
      if (clearRxdb) await rxdb.deInitGlobal() // сначала очистим базу, потом resetLocalStorage (ей может понадобиться k_token)
      if (clearAuthData) await resetLocalStorage()
      if (process.env.MODE === 'pwa') await pwaReset()
      if (clearAuthData) {
         localStorage.setItem('k_logout_date', Date.now().toString())
      } // сообщаем другим вкладкам
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      let hardReset = confirm('critical error on systemReset: ' + JSON.stringify(err) + '\n\n Make hardReset?')
      if (hardReset) {
         await systemHardReset()
         window.location.reload()
      }
   } finally {
      resetDates.push(Date.now())
      sessionStorage.setItem('k_system_reset_dates', JSON.stringify(resetDates))
      globalRelease()
      if (reload) window.location.reload()
   }
}

// если уже войдено - ничего не сделает (опирается на k_user_oid и k_token)
// если не войдено - попытается войти
async function systemInit () {
   const f = systemInit
   logD(f, 'start')
   const t1 = performance.now()
   if (await rxdb.isInitializedGlobal() && localStorage.getItem('k_token')) { // k_token нужен для gql-запросов
      logD(f, 'skip systemInit')
      return
   } // уже войдено!
   try {
      await globalLock()
      let userOid = localStorage.getItem('k_user_oid')
      if (userOid) { // пользователь зарегистрирован
         await rxdb.initGlobal({ userOid })
      } else { // пытаемся войти без регистрации
         if (!localStorage.getItem('k_token')) {
            const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
            logD('userIdentify = ', { userExist, userId, needInvite, needConfirm, dummyUser, loginType })
            if (needConfirm === false && dummyUser) {
               await rxdb.initGlobal({ dummyUser })
            }
         }
      }
      if (await rxdb.isInitializedGlobal()) {
         await i18next.changeLanguage(rxdb.getCurrentUser().profile.lang)
         if (sessionStorage.getItem('k_originalUrl')) { // если зашли по ссылке поделиться(бэкенд редиректит в корень с query =  originalUrl)
            logD(f, 'redirect to originalUrl: ' + sessionStorage.getItem('k_originalUrl'))
            await router.replace(sessionStorage.getItem('k_originalUrl'))
            sessionStorage.removeItem('k_originalUrl')
         }
         localStorage.setItem('k_login_date', Date.now().toString()) // сообщаем другим вкладкам
      } else { // не удалось залогиниться
         logD(f, 'GO LOGIN')
         await resetLocalStorage()
         await router.replace('/auth')
         localStorage.setItem('k_logout_date', Date.now().toString()) // сообщаем другим вкладкам
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
   await wait(2000)
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
   await wait(2000)
   window.location.reload()
}

export {
   getInstanceId,
   isLeader,
   globalLock,
   globalRelease,
   initServices,
   systemReset,
   shareWith,
   initSessionStorage,
   systemInit
}
