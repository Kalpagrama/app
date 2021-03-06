import {assert} from 'src/system/common/utils'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.MUTEX)

// локальный мьютекс с соблюдением очереди захвата
class MutexLocal {
   constructor (name) {
      assert(name, 'name')
      this.queue = []
      this.locked = false
      this.lockOwner = null
      this.name = name
      this.lockDate = null
      this.timerWarnId = null
      this.timerErrId = null
   }

   async lock (lockOwner) {
      assert(lockOwner, '!lockOwner')
      return await new Promise((resolve, reject) => {
         logD(`${lockOwner} ${this.name} lock start locked=${this.locked} this.lockOwner=${this.lockOwner} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         if (this.locked) {
            this.queue.push({ resolve, reject, lockOwner, lockDate: Date.now() })
            logD(`${lockOwner} ${this.name} lock queued!  queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         } else {
            this.timerWarnId = setInterval(() => logW(`${this.name} possible deadlock! locked by:${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`), 10 * 1000)
            // this.timerErrId = setTimeout(() => {
            //    logE(`${lockOwner} ${this.name} deadlock detected! this.lockOwner=${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
            //    reject(new Error('deadlock detected! reject all locks')) // current
            //    for (let { reject } of this.queue) reject(new Error('deadlock detected! reject all locks')) // queued
            //    this.locked = false
            //    this.queue = []
            //    if (this.timerWarnId) clearInterval(this.timerWarnId)
            // }, 60 * 1000)
            this.locked = true
            this.lockOwner = lockOwner
            this.lockDate = Date.now()
            logD(`${lockOwner} ${this.name} lock complete`)
            resolve()
         }
      })
   }

   release () {
      assert(this.lockOwner, '!this.lockOwner')
      let lockOwnerOld = this.lockOwner
      if (Date.now() - this.lockDate > 5 * 1000) logW(`mutex::${this.name} long operation! lockOwner=${this.lockOwner} duration=${Date.now() - this.lockDate}`)
      if (this.queue.length > 0) {
         const { resolve, reject, lockOwner, lockDate } = this.queue.shift()
         this.lockOwner = lockOwner
         this.lockDate = Date.now()
         resolve()
      } else {
         if (this.timerWarnId) clearInterval(this.timerWarnId)
         if (this.timerErrId) clearTimeout(this.timerErrId)
         this.locked = false
         this.lockOwner = null
         this.lockDate = null
      }
      logD(`${lockOwnerOld} ${this.name}. release lock complete. this.lockOwner=${this.lockOwner} lockOwnerOld=${lockOwnerOld} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))} ${this.locked}`)
   }
}

export { MutexLocal }
