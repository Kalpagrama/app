import { boot } from 'quasar/wrappers'
import { getLogFunc, initLogger, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
import testsReactive from 'tests/reactive.test'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.TESTS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.TESTS)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.TESTS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.TESTS)

export default boot(async ({ app, router, store, ssrContext, urlPath, publicPath, redirect }) => {
   if (!process.env.RUN_TESTS) return
   logD('start tests!')
   await testsReactive({ app, router, store, ssrContext, urlPath, publicPath, redirect })
})
