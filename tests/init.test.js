// runtime tests!!!
import { systemInit } from 'src/system/services'
import { assert } from 'src/system/common/utils'
import { AuthApi } from 'src/api/auth'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

async function checkSystemInit ({ app, router, store }) {
   const f = checkSystemInit
   logD(f, 'start')
   const t1 = performance.now()
   await systemInit()
   logD(f, `systemInit complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

async function checkCurrentUser ({ app, router, store }) {
   let userVuex = store.getters.currentUser
   return !!userVuex
   // let user = await rxdb.get(RxCollectionEnum.OBJ, userVuex.oid)
}

async function checkLogin ({ app, router, store }) {
   let { userId, dummyUser } = await AuthApi.userIdentify('4321ip@mail.ru')
   let { result, role, oid, failReason } = await AuthApi.userAuthenticate('7809')
   return !!result
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
   await check(checkSystemInit)
   await check(checkCurrentUser)
   await check(checkLogin)
   return true
}
