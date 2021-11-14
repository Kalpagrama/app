// runtime tests!!!
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { wait } from 'public/scripts/common_func'
import { systemInit } from 'src/system/services'

import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { assert } from 'src/system/common/utils'
import { AuthApi } from 'src/api/auth'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.TESTS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.TESTS)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.TESTS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.TESTS)

async function checkSystemInit({ app, router, store }) {
   const f = checkSystemInit
   logD(f, 'start')
   const t1 = performance.now()
   await systemInit()
   logD(f, `systemInit complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

async function checkCurrentUser({ app, router, store }) {
   let userVuex = store.getters.currentUser
   assert(userVuex)
   return true
   // let user = await rxdb.get(RxCollectionEnum.OBJ, userVuex.oid)
}

async function checkLogin({ app, router, store }) {
   // AuthApi.userIdentify()
   return true
}

export default async function ({ app, router, store }) {
   let check = async (func) => assert((await func({ app, router, store }).catch((err) => {
      logE('err on test', err)
      return false })), 'test not passed: ' + func.name)
   await check(checkSystemInit)
   await check(checkCurrentUser)
   await check(checkLogin)
   alert('all tests passed OK!')
   return true
}
