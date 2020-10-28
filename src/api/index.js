import { MutexLocal } from 'src/system/rxdb/mutex'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

const apiMutex = new MutexLocal('apiMutex')

async function apiCall (f, cb, serialize = true) {
   assert(f && typeof f === 'function' && typeof cb === 'function')
   try {
      if (serialize) await apiMutex.lock(f.name)
      return await cb()
   } catch (err) {
      logE('apiCall ERROR', err)
      throw err
   } finally {
      if (serialize) apiMutex.release()
   }
}

export { apiCall }
