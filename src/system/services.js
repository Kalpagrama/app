import {getLogFunc, LogLevelEnum, LogSystemModulesEnum} from 'src/boot/log'
import {Notify, Platform} from 'quasar'
import {i18n} from 'src/boot/i18n'
import {RxCollectionEnum, rxdb} from 'src/system/rxdb'
import {askForPwaWebPushPerm, initPWA, pwaReset, pwaShareWith} from 'src/system/pwa'
import {router} from 'src/boot/main'
import assert from 'assert';
import i18next from 'i18next'
import {resetLocalStorageData} from 'src/api/auth'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.SW)

async function initServices(store) {
  const f = initServices
  logD(f, 'start', Platform.is, process.env.MODE)
  const t1 = performance.now()
  if (process.env.MODE === 'pwa') {
    await initPWA(store)
  } else if (Platform.is.capacitor) {
    const {initCapacitor} = await import('src/system/capacitor.js')
    await initCapacitor(store)
  } else if (Platform.is.cordova) {
    const {initCordova} = await import('src/system/cordova.js')
    await initCordova(store)
  }
  initOfflineEvents(store)
  // todo запрашивать тольько когда юзер первый раз ставит приложение и из настроек!!!
  const hasPerm = await askForWebPushPerm(store)
  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, hasPerm)
}

async function shareWith(object){
  const f = shareWith
  logD(f, 'start', Platform.is, process.env.MODE)
  const t1 = performance.now()
  let title, text, url
  assert(object && object.oid && object.type)
  switch (object.type){
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

function initOfflineEvents(store) {
  function handleNetworkChange(event) {
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

// очистить кэши и БД
async function systemReset() {
  const f = systemReset
  logD(f, 'start')
  const t1 = performance.now()
  if (process.env.MODE === 'pwa') await pwaReset()
  await rxdb.clearAll()
  await rxdb.deinit()
  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
}

async function askForWebPushPerm(store) {
  if (Platform.is.capacitor) {
    const {initCapacitorPushPlugin} = await import('src/system/capacitor.js')
    await initCapacitorPushPlugin(store)
    return true
  } else if (Platform.is.cordova) {
    const {initCordovaPushPlugin} = await import('src/system/cordova.js')
    await initCordovaPushPlugin(store)
    return true
  } else if (process.env.MODE === 'pwa') {
    return await askForPwaWebPushPerm(store)
  }
}

async function systemInit(store) {
  const f = systemInit
  logD(f, 'start')
  const t1 = performance.now()
  let res = {authenticated: false}
  let userOid = localStorage.getItem('k_user_oid')
  if (userOid) {
    try {
      await rxdb.init(userOid)
      let currentUser = await rxdb.get(RxCollectionEnum.OBJ, userOid)
      assert(currentUser, 'currentUser обязан быть после rxdb.init')
      // logD(f, 'currentUser= ', currentUser)
      await store.dispatch('init', currentUser)
      await i18next.changeLanguage(currentUser.profile.lang)
      res.authenticated = true
    } catch (err) {
      logE('error on systemInit!', err)
      await resetLocalStorageData()
      await systemReset()
      throw err
    }
  }
  logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  return res
}

export {initServices, systemReset, systemInit, shareWith}
