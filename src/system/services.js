import { isSsr } from 'src/system/log'

async function initApplication () {
   if (isSsr) {
      const {initApplication} = await import('src/system/services_ssr')
      await initApplication()
   } else {
      const {initApplication} = await import('src/system/services_browser')
      await initApplication()
   }
}

async function systemReset (clearAuthData = false, clearRxdb = true, reload = true, pwaResetFlag = true) {
   if (isSsr) {
      const {systemReset} = await import('src/system/services_ssr')
      await systemReset(clearAuthData, clearRxdb, reload, pwaResetFlag)
   } else {
      const {systemReset} = await import('src/system/services_browser')
      await systemReset(clearAuthData, clearRxdb, reload, pwaResetFlag)
   }
}

async function systemInit () {
   if (isSsr) {
      const {systemInit} = await import('src/system/services_ssr')
      await systemInit()
   } else {
      const {systemInit} = await import('src/system/services_browser')
      await systemInit()
   }
}

export {
   initApplication,
   systemReset,
   systemInit
}
