// import { LoadingBar } from 'quasar'
import { MutexLocal } from 'src/system/rxdb/mutex_local'
import {assert} from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { notify } from 'src/boot/notify'
import { store } from 'src/store'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.API)

const apiMutex = new MutexLocal('apiMutex')

// LoadingBar.setDefaults({
//    color: 'green',
//    size: '4px',
//    position: 'top'
// })

async function apiCall (func, cb, serialize = true) {
   assert(func && typeof func === 'function' && typeof cb === 'function')
   const f = apiCall
   // logD(f, 'start')
   const t1 = performance.now()
   let t2 = performance.now()
   try {
      // if (store && store.state.ui.useDebug) LoadingBar.start()
      if (serialize) await apiMutex.lock(func.nameExtra || func.name)
      t2 = performance.now()
      let result = await cb()
      if (performance.now() - t2 > 2000) logW(f, `complete (long operation): ${Math.floor(performance.now() - t2)} msec`, func.nameExtra || func.name)
      // logD(f, `complete: ${Math.floor(performance.now() - t1)}/${Math.floor(performance.now() - t2)} msec`, func.nameExtra || func.name)
      return result
   } catch (err) {
      logE('apiCall ERROR', err)
      notify('error', `ошибка при выполнении запроса: ${err.message}`)
      throw err
   } finally {
      if (serialize) apiMutex.release()
      // if (store && store.state.ui.useDebug) LoadingBar.stop()
   }
}

export { apiCall }
