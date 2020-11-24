import { mutexGlobal, MutexLocal } from 'src/system/rxdb/mutex'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { AppVisibility, Notify, Platform, Loading } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith } from 'src/system/pwa'
import assert from 'assert';
import i18next from 'i18next'
import { AuthApi } from 'src/api/auth'
import { wait } from 'src/system/utils'
import { router } from 'src/boot/system'
import store from 'src/store/index'
import { ContentApi } from 'src/api/content'
import { makeRoutePath } from 'public/scripts/common_func'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SYSTEM)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SYSTEM)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SYSTEM)

const logMD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logME = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logMW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

let initialized = false

let capacitor

class SystemUtils {
   async vibrate (patternOrDuration = 100) {
      if (Platform.is.capacitor) await capacitor.vibrate()
      else if (navigator.vibrate) navigator.vibrate(patternOrDuration)
   }

   async hapticsImpact (style = 'medium') {
      if (Platform.is.capacitor) await capacitor.hapticsImpact(style)
      else if (navigator.vibrate) navigator.vibrate(50)
   }

   async shareOut (object) {
      await shareOut(object)
   }

   async reset () {
      await systemReset()
   }

   async statusBarSetVisible (visible) {
      if (Platform.is.capacitor) await capacitor.statusBarSetVisible(visible)
   }

   async statusBarSetStyle (style) {
      if (Platform.is.capacitor) await capacitor.statusBarSetStyle(style)
   }

   orientationLockEnabled (mode) {
      return !!Platform.is.capacitor
   }

   async orientationLock (mode) {
      if (Platform.is.capacitor) await capacitor.orientationLock(mode)
   }

   async openUrl (urlStr, inAppBrowser = false) {
      if (Platform.is.capacitor && inAppBrowser) await capacitor.openUrl(urlStr)
      else window.location = urlStr
   }

   async screenshot () {
      if (Platform.is.capacitor) await capacitor.screenshot()
   }
}

async function initApplication () {
   const f = initApplication
   logD(f, 'start', Platform.is, process.env.MODE)
   const t1 = performance.now()
   initOfflineEvents(store)

   if (process.env.MODE === 'pwa') {
      await initPWA(store)
   } else if (Platform.is.capacitor) {
      capacitor = await import('src/system/capacitor.js')
      await capacitor.init(store)
   }
   // todo запрашивать тольько когда юзер первый раз ставит приложение и из настроек!!!
   askForWebPushPerm(store).catch(err => logE('cant get permissions', err))

   let storageEventMutex = new MutexLocal('storageEventMutex')
   // подписываемся на изменение localStorage (Событие НЕ работает на вкладке, которая вносит изменения)
   // upd В сафари событие срабатывает и на вкладке, которая инициировала изменения
   window.addEventListener('storage', async function (event) {
      try {
         await storageEventMutex.lock('onStorageEvent')// события валятся параллельно (второе приходит не дожидаясь выполнения первого)
         if (!event.key || !event.key.in('k_login_date', 'k_logout_date', 'k_rxdb_create_date', 'k_rxdb_init_global_date', 'k_rxdb_deinit_global_date')) return
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
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   return new SystemUtils()
}

// В сафари событие срабатывает и на вкладке, которая инициировала изменения (храним id вкладки в событии)
function setSyncEventStorageValue (key, value) {
   const f = setSyncEventStorageValue
   logD(f, key, value, mutexGlobal.getInstanceId())
   assert(key.in('k_login_date', 'k_logout_date', 'k_rxdb_create_date', 'k_rxdb_init_global_date', 'k_rxdb_deinit_global_date'), 'bad key: ' + key)
   assert(key && value && mutexGlobal.getInstanceId(), '!key && value' + key + value)
   localStorage.setItem(key, JSON.stringify({ value, instanceId: mutexGlobal.getInstanceId() })) // сообщаем другим вкладкам
}

// поделиться в кальпаграма
async function shareIn ({ contentUrl } = {}) {
   const f = shareIn
   if (contentUrl) {
      try {
         // alert('shareIn1')
         Loading.show({
            message: `Content upload is in progress <b>${contentUrl}</b> <br/><span class="text-light">Hang on...</span>`
         })
         // alert('shareIn2')
         let content = await ContentApi.contentCreateFromUrl(contentUrl)
         let bookmarkInput = {
            type: content.type,
            oid: content.oid,
            name: content.name,
            thumbUrl: content.thumbUrl
         }
         await rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
         // alert('shareIn3')
         let route = makeRoutePath(content)
         // alert('shareIn4')
         logD(f, 'go to route', route)
         // alert('route = ' + route)
         await router.push(route)
         // alert('shareIn5')
      } finally {
         Loading.hide()
      }
   }
}

// поделиться из кальпаграма
async function shareOut (object) {
   const f = shareOut
   // alert('shareOut:' + JSON.stringify(object))
   logD(f, 'start', Platform.is, process.env.MODE, object)
   const t1 = performance.now()
   let title, text, url
   assert(object && object.oid && object.type)
   url = makeRoutePath(object, true)
   logD(f, 'url=', url)
   if (object) {
      title = object.name
      text = object.name
   }
   // alert('shareOut url =' + url)
   // alert('shareOut text =' + text)
   // alert('shareOut title =' + title)
   if (process.env.MODE === 'pwa' || process.env.MODE === 'spa') {
      await pwaShareWith(title || '', text || '', url)
   } else if (Platform.is.capacitor) {
      await capacitor.shareOut(title || '', text || '', url)
   }
   // alert('shareOut end ')
   logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

async function askForWebPushPerm (store) {
   if (Platform.is.capacitor) {
      await capacitor.initPushPlugin(store)
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
async function systemReset (clearAuthData = false, clearRxdb = true, reload = true, pwaResetFlag = true) {
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
      if (pwaResetFlag && process.env.MODE === 'pwa') await pwaReset()
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
   if (await rxdb.isInitializedGlobal()) {
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
      await systemReset(true, true, true, true)
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
         // alert('systemHardReset 1. dbs = ' + JSON.stringify(dbs))
         // alert('systemHardReset 1. localStorage = ' + JSON.stringify(localStorage))
         for (let db of dbs) {
            // alert('indexedDB.deleteDatabase(databaseName): ' + db.name)
            logD('indexedDB.deleteDatabase(databaseName): ' + db.name)
            window.indexedDB.deleteDatabase(db.name)
         }
      } else {
         // alert('systemHardReset 2')
         for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i)
            if (key.includes('rxdb')) {
               // alert('indexedDB.deleteDatabase(databaseName): ' + key)
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
   initApplication,
   setSyncEventStorageValue,
   systemReset,
   shareIn,
   initSessionStorage,
   systemInit
}
