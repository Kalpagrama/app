import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { Notify, Platform } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { rxdb } from 'src/system/rxdb'
import { askForPwaWebPushPerm, initPWA, pwaReset } from 'src/system/pwa'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.SW)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.SW)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.SW)

async function initServices (store) {
  let f = initServices
  logD(f, 'start', Platform.is, process.env.MODE)
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
  logD(f, 'complete! notification permission = ', hasPerm)
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

// очистить кэш сервис-воркера
async function systemReset (force = false) {
  let f = systemReset
  logD(f, 'start')
  if (process.env.MODE === 'pwa') await pwaReset(force)
  await rxdb.clearAll()
  logD(f, 'complete')
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
  } else if (process.env.MODE === 'pwa'){
    return await askForPwaWebPushPerm(store)
  }
}

export { initServices, systemReset }
