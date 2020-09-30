import {mutexGlobal, MutexLocal } from 'src/system/rxdb/mutex'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { AppVisibility, Notify, Platform } from 'quasar'
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

const logMD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logME = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logMW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

let initialized = false
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
   let storageEventMutex = new MutexLocal('storageEventMutex')
   // подписываемся на изменение localStorage (Событие НЕ работает на вкладке, которая вносит изменения)
   window.addEventListener('storage', async function (event) {
      try {
         await storageEventMutex.lock('onStorageEvent')// события валятся параллельно (второе приходит не дожидаясь выполнения первого)
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
   if (!sessionStorage.getItem('k_log_format')) sessionStorage.setItem('k_log_format', JSON.stringify({time: false, moduleName: true, funcName: true}))
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
      await mutexGlobal.lock('system::resetLocalStorage')
      for (let i = 0; i < localStorage.length; i++) {
         let key = localStorage.key(i)
         if (key.startsWith('k_')) localStorage.removeItem(key)
      }
   } finally {
      mutexGlobal.release()
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
      await mutexGlobal.lock('system::systemReset')
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
      mutexGlobal.release()
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
      await mutexGlobal.lock('system::systemInit')
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
      mutexGlobal.release()
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
   initServices,
   systemReset,
   shareWith,
   initSessionStorage,
   systemInit
}
