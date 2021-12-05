// runtime tests!!!
import { systemInit } from 'src/system/services'

import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { assert } from 'src/system/common/utils'
import { rxdb, RxCollectionEnum } from 'src/system/rxdb'
import { watch } from 'vue'
import { wait } from 'src/system/common/common_func'
import { ObjectApi } from 'src/api/object'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.TESTS)

async function checkReactiveChange ({ app, router, store }) {
   const f = checkReactiveChange
   logD(f, 'start')
   const t1 = performance.now()
   let userVuex = store.getters.currentUser
   let rxdbUser = await rxdb.get(RxCollectionEnum.OBJ, userVuex.oid)
   // let rxdbUser = await rxdb.get(RxCollectionEnum.OBJ, '246758103888955401')
   let itemUnsubscribeFunc0 = watch(() => userVuex, async (newVal, oldVal) => {
      logD('userVuex changed', newVal.profile.lang)
      alert('userVuex changed')
   }, {deep: true})
   let itemUnsubscribeFunc = watch(() => rxdbUser, async (newVal, oldVal) => {
      logD('rxdbUser changed', newVal.name)
      alert('rxdbUser changed')
   }, {deep: true})
   await rxdbUser.updateExtended('name', rxdbUser.name + '_7', false)
   // rxdbUser.name = rxdbUser.name + '111'
   logD(f, `systemInit complete: ${Math.floor(performance.now() - t1)} msec`)
   return true
}

async function checkReactiveChangeLang ({ app, router, store }) {
   const f = checkReactiveChangeLang
   logD(f, 'start')
   const t1 = performance.now()
   let userVuex = store.getters.currentUser
   let rxdbUser = await rxdb.get(RxCollectionEnum.OBJ, userVuex.oid)
   // let rxdbUser = await rxdb.get(RxCollectionEnum.OBJ, '246758103888955401')

   let itemUnsubscribeFunc0 = watch(() => userVuex, async (newVal, oldVal) => {
      logD('userVuex changed', newVal.profile.lang)
      alert('userVuex changed')
   }, {deep: true})
   let itemUnsubscribeFunc = watch(() => rxdbUser, async (newVal, oldVal) => {
      logD('rxdbUser changed', newVal.profile.lang)
      alert('rxdbUser changed')
   }, {deep: true})
   await ObjectApi.update(store.getters.currentUser.oid, 'profile.lang', store.getters.currentUser.profile.lang === 'RUS' ? 'ENG' : 'RUS')
   // rxdbUser.name = rxdbUser.name + '111'
   logD(f, `systemInit complete: ${Math.floor(performance.now() - t1)} msec`)
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
   await check(checkReactiveChange)
   // await check(checkReactiveChangeLang)
   alert('testsReactive passed!')
   return true
}
