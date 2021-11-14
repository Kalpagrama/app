import { boot } from 'quasar/wrappers'
import { getLogFunc, initLogger, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import testsReactive from 'tests/reactive.test'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.TESTS)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   logD('start tests!')
   await testsReactive({ app, router, store, ssrContext, urlPath, publicPath, redirect })
})
