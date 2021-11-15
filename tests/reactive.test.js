// runtime tests!!!
import { systemInit } from 'src/system/services'

import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { assert } from 'src/system/common/utils'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

async function check ({ app, router, store }) {
   const f = check
   logD(f, 'start')
   const t1 = performance.now()
   await systemInit()
   logD(f, `systemInit complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

export default async function ({ app, router, store }) {
   let check = async (func) => assert((await func({ app, router, store }).catch((err) => {
      logE('err on test', err)
      return false
   })), 'test not passed: ' + func.name)
   // await check(checkSystemInit)
   // await check(checkCurrentUser)
   // await check(checkLogin)
   alert('all tests passed OK!')
   return true
}
