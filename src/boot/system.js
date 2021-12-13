import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { systemInit } from 'src/system/services'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

function t (str) {
  return str
}

let router

export default boot(async ({ app, router: VueRouter, store, ssrContext, urlPath, publicPath, redirect }) => {
  try {
    const f = {nameExtra: 'boot::system'}
    logD(f, 'start')
    const t1 = performance.now()
    router = VueRouter
    const {initApplication} = await import('src/system/services')
    app.config.globalProperties.$systemUtils = await initApplication()
    await systemInit()
    logT(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC('cant boot::system', err)
    throw err // без initApplication работать не можем!
  }
})

export { t, router }
