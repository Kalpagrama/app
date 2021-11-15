// runtime tests!!!
import { systemReset } from 'src/system/services'

import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { assert } from 'src/system/common/utils'
import { AuthApi } from 'src/api/auth'
import { UserRoleEnum } from 'src/system/common/enums'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

async function checkLogout ({ app, router, store }) {
   assert(store.getters.currentUser && store.getters.currentUser.profile.role.in(UserRoleEnum.ADMIN, UserRoleEnum.MODERATOR, UserRoleEnum.MEMBER))
   assert(localStorage.getItem('k_token'))
   let { userId, dummyUser } = await AuthApi.logout()
   let { result, role, oid, failReason } = await AuthApi.userAuthenticate('7809')
   return !!result
}

async function checkSystemReset ({ app, router, store }) {
   const f = checkSystemReset
   logD(f, 'start')
   const t1 = performance.now()
   await systemReset(true, true, false, true)
   logD(f, `systemReset complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

export default async function ({ app, router, store }) {
   let check = async (func) => assert((await func({ app, router, store }).catch((err) => {
      logE('err on test', err)
      return false
   })), 'test not passed: ' + func.name)
   await check(checkLogout)
   await check(checkSystemReset)
   alert('all tests passed OK!')
   return true
}
