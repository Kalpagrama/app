async function initApplication () {
   if (process.env.MODE === 'ssr') {
      const {initApplication} = await import('src/system/services_ssr')
      await initApplication()
   } else {
      const {initApplication} = await import('src/system/services_browser')
      await initApplication()
   }
}

async function systemReset (clearAuthData = false, clearRxdb = true, reload = true, pwaResetFlag = true) {
   if (process.env.MODE === 'ssr') {
      const {systemReset} = await import('src/system/services_ssr')
      await systemReset(clearAuthData, clearRxdb, reload, pwaResetFlag)
   } else {
      const {systemReset} = await import('src/system/services_browser')
      await systemReset(clearAuthData, clearRxdb, reload, pwaResetFlag)
   }
}

async function systemInit () {
   if (process.env.MODE === 'ssr') {
      const {systemInit} = await import('src/system/services_ssr')
      await systemInit()
   } else {
      const {systemInit} = await import('src/system/services_browser')
      await systemInit()
   }
}

async function initSessionStorage () {
   if (process.env.MODE === 'ssr') {
      const {initSessionStorage} = await import('src/system/services_ssr')
      await initSessionStorage()
   } else {
      const {initSessionStorage} = await import('src/system/services_browser')
      await initSessionStorage()
   }
}

export {
   initApplication,
   systemReset,
   systemInit,
   initSessionStorage
}
