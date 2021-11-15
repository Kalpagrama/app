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
   // alert('testsDeInit passed OK!')
   await testsInit({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   alert('testsInit passed OK!')
   await testsRxdb({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   alert('testsRxdb passed OK!')
   await testsReactive({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   alert('testsReactive passed OK!')
   // await testsDeInit({ app, router, store, ssrContext, urlPath, publicPath, redirect })
   alert('all tests passed OK!')
})
