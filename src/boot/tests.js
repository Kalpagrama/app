import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import testsDeInit from 'tests/deInit.test'
import testsRxdb from 'tests/rxdb.test'
import testsInit from 'tests/init.test'
import testsReactive from 'tests/reactive.test'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   logD('start tests!')
   alert('start tests!')
   // await testsDeInit({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   await testsInit({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   // await testsRxdb({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   await testsReactive({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   // await testsDeInit({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   alert('all tests passed!')
})
