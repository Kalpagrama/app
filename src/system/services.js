import { mutexGlobal, MutexLocal } from 'src/system/rxdb/mutex'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { AppVisibility, Notify, Platform } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith } from 'src/system/pwa'
import assert from 'assert';
import i18next from 'i18next'
import { AuthApi } from 'src/api/auth'
import { wait } from 'src/system/utils'
import { router } from 'src/boot/system'

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
   // upd В сафари событие срабатывает и на вкладке, которая инициировала изменения
   window.addEventListener('storage', async function (event) {
      try {
         if (!event.key.in('k_login_date', 'k_logout_date', 'k_rxdb_create_date', 'k_rxdb_init_global_date', 'k_rxdb_deinit_global_date')) return
         await storageEventMutex.lock('onStorageEvent')// события валятся параллельно (второе приходит не дожидаясь выполнения первого)
         if (event.newValue) {
            logD('storage sync event:', event)
            const getSyncEventStorageValue = (strValue) => { // В сафари событие срабатывает и на вкладке, которая инициировала изменения
               let res = JSON.parse(strValue)
               assert(res.value && res.instanceId, '!res.value && res.instanceId')
               if (res.instanceId !== mutexGlobal.getInstanceId()) return res.value // не реагируем сами на себя
            }
            switch (event.key) {
               case 'k_login_date':
                  logD(`localStorage auth event: ${event.key}`, event)
                  if (getSyncEventStorageValue(event.newValue)) await router.replace('/home')
                  break
               case 'k_logout_date':
                  logD(`localStorage auth event: ${event.key}`, event)
                  if (getSyncEventStorageValue(event.newValue)) await router.replace('/auth')
                  break
               case 'k_rxdb_create_date':
               case 'k_rxdb_init_global_date':
               case 'k_rxdb_deinit_global_date':
                  if (getSyncEventStorageValue(event.newValue)) await rxdb.processStoreEvent(event.key)
                  break
            }
         }
      } finally {
         storageEventMutex.release()
      }
   })
   initialized = true
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, hasPerm)
}

// В сафари событие срабатывает и на вкладке, которая инициировала изменения (храним id вкладки в событии)
function setSyncEventStorageValue (key, value) {
   const f = setSyncEventStorageValue
   logD(f, key, value, mutexGlobal.getInstanceId())
   assert(key.in('k_login_date', 'k_logout_date', 'k_rxdb_create_date', 'k_rxdb_init_global_date', 'k_rxdb_deinit_global_date'), 'bad key: ' + key)
   assert(key && value && mutexGlobal.getInstanceId(), '!key && value' + key + value)
   localStorage.setItem(key, JSON.stringify({ value, instanceId: mutexGlobal.getInstanceId() })) // сообщаем другим вкладкам
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

function orientationLockEnabled (mode) {
   return !!Platform.is.capacitor
}
async function orientationLock (mode) {
   const { capacitorOrientationLock } = await import('src/system/capacitor.js')
   if (Platform.is.capacitor) await capacitorOrientationLock(mode)
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
   if (!sessionStorage.getItem('k_log_format')) {
      sessionStorage.setItem('k_log_format', JSON.stringify({
         time: false,
         moduleName: true,
         funcName: true
      }))
   }
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
         if (key.startsWith('k_') && key !== 'k_global_lock') localStorage.removeItem(key)
      }
   } finally {
      await mutexGlobal.release('system::resetLocalStorage')
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
         setSyncEventStorageValue('k_logout_date', Date.now().toString())
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
      await mutexGlobal.release('system::systemReset')
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
      // alert('skip systemInit')
      return
   } // уже войдено!
   try {
      await mutexGlobal.lock('system::systemInit')
      let userOid = localStorage.getItem('k_user_oid')
      if (userOid) { // пользователь зарегистрирован
         // alert(' systemInit 1 ')
         await rxdb.initGlobal({ userOid })
      } else { // пытаемся войти без регистрации
         // alert(' systemInit 2 ')
         if (!localStorage.getItem('k_token')) {
            // alert(' systemInit 3 ')
            const { userExist, userId, needInvite, needConfirm, dummyUser, loginType } = await AuthApi.userIdentify(null)
            logD('userIdentify = ', { userExist, userId, needInvite, needConfirm, dummyUser, loginType })
            if (needConfirm === false && dummyUser) {
               await rxdb.initGlobal({ dummyUser })
            }
         }
      }
      // alert(' systemInit 4 ')
      if (await rxdb.isInitializedGlobal()) {
         // alert(' systemInit 5 ')
         await i18next.changeLanguage(rxdb.getCurrentUser().profile.lang)
         if (sessionStorage.getItem('k_originalUrl')) { // если зашли по ссылке поделиться(бэкенд редиректит в корень с query =  originalUrl)
            logD(f, 'redirect to originalUrl: ' + sessionStorage.getItem('k_originalUrl'))
            await router.replace(sessionStorage.getItem('k_originalUrl'))
            sessionStorage.removeItem('k_originalUrl')
         }
         setSyncEventStorageValue('k_login_date', Date.now().toString()) // сообщаем другим вкладкам
      } else { // не удалось залогиниться
         // alert(' systemInit 6 ')
         logD(f, 'GO LOGIN')
         await resetLocalStorage()
         await router.replace('/auth')
         setSyncEventStorageValue('k_logout_date', Date.now().toString()) // сообщаем другим вкладкам
      }
      // alert(' systemInit 7 ')
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   } catch (err) {
      logE('error on systemInit!', err)
      await systemReset(true, true, true)
      throw err
   } finally {
      await mutexGlobal.release('system::systemInit')
   }
}

async function systemHardReset () {
   await wait(1000)
   if (window.indexedDB) {
      if (window.indexedDB.databases) {
         let dbs = await window.indexedDB.databases()
         alert('systemHardReset 1. dbs = ' + JSON.stringify(dbs))
         alert('systemHardReset 1. localStorage = ' + JSON.stringify(localStorage))
         for (let db of dbs) {
            alert('indexedDB.deleteDatabase(databaseName): ' + db.name)
            logD('indexedDB.deleteDatabase(databaseName): ' + db.name)
            window.indexedDB.deleteDatabase(db.name)
         }
      } else {
         alert('systemHardReset 2')
         for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i)
            if (key.includes('rxdb')) {
               alert('indexedDB.deleteDatabase(databaseName): ' + key)
               logD('indexedDB.deleteDatabase(databaseName): ' + key)
               window.indexedDB.deleteDatabase(key)
            }
         }
      }
   } else window.alert('Ваш браузер не поддерживат стабильную версию IndexedDB.')
   if (process.env.MODE === 'pwa') await pwaReset()
   localStorage.clear()
   sessionStorage.clear()
   logD('systemHardReset complete')
   await wait(1000)
   // alert('reload after systemHardReset...')
   window.location.reload()
}

{
   /**
    * Polyfill for indexedDB.databases()
    * Safari and some other older browsers that support indexedDB do NOT
    * Support enumerating existing databases. This is problematic when it
    * comes time to cleanup, otherwise we could litter their device with
    * unreferenceable database handles forcing a nuclear browser clear all history.
    */
   if (window && window.indexedDB && typeof window.indexedDB.databases === 'undefined') {
      const LOCALSTORAGE_CACHE_KEY = 'indexedDBDatabases';

      // Store a key value map of databases
      const getFromStorage = () =>
         JSON.parse(window.localStorage[LOCALSTORAGE_CACHE_KEY] || '{}');

      // Write the database to local storage
      const writeToStorage = value =>
         (window.localStorage[LOCALSTORAGE_CACHE_KEY] = JSON.stringify(value));

      IDBFactory.prototype.databases = () =>
         Promise.resolve(
            Object.entries(getFromStorage()).reduce((acc, [name, version]) => {
               acc.push({ name, version });
               return acc;
            }, [])
         );

      // Intercept the existing open handler to write our DBs names
      // and versions to localStorage
      const open = IDBFactory.prototype.open;

      IDBFactory.prototype.open = function (...args) {
         const dbName = args[0];
         const version = args[1] || 1;
         const existing = getFromStorage();
         writeToStorage({ ...existing, [dbName]: version });
         return open.apply(this, args);
      };

      // Intercept the existing deleteDatabase handler remove our
      // dbNames from localStorage
      const deleteDatabase = IDBFactory.prototype.deleteDatabase;

      IDBFactory.prototype.deleteDatabase = function (...args) {
         const dbName = args[0];
         const existing = getFromStorage();
         delete existing[dbName];
         writeToStorage(existing);
         return deleteDatabase.apply(this, args);
      };
   }
}

export {
   initServices,
   setSyncEventStorageValue,
   orientationLockEnabled,
   orientationLock,
   systemReset,
   shareWith,
   initSessionStorage,
   systemInit
}
