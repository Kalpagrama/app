// runtime tests!!!
import { systemReset } from 'src/system/services'

import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { assert } from 'src/system/common/utils'
import { AuthApi } from 'src/api/auth'
import { UserRoleEnum } from 'src/system/common/enums'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

async function checkLogout ({ app, router, store }) {
   await AuthApi.logout()
   return true
}

async function checkSystemReset ({ app, router, store }) {
   const f = checkSystemReset
   logD(f, 'start')
   const t1 = performance.now()
   await systemReset(true, true, true)
   logD(f, `systemReset complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

export default async function ({ app, router, store }) {
   let check = async (func) => assert((await func({ app, router, store })
      .then((res) => {
         logD('check passed', func.name)
         return res
      })
      .catch((err) => {
      logE('err on test', err)
      return false
   })), 'test not passed: ' + func.name)
   await check(checkLogout)
   await check(checkSystemReset)
   alert('testsDeInit passed!')
   return true
}
