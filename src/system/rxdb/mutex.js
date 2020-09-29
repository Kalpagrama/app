import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

class Mutex {
   constructor (name) {
      assert(name, 'name')
      this.queue = []
      this.locked = false
      this.lockOwner = null
      this.name = name
      this.timerWarnId = null
      this.timerErrId = null
   }

   lock (lockOwner) {
      assert(lockOwner, '!lockOwner')
      return new Promise((resolve, reject) => {
         if (this.locked) {
            logD(`${lockOwner} try lock ${this.name}. Already locked by ${this.lockOwner}`)
            this.queue.push([resolve, reject, lockOwner])
         } else {
            this.timerWarnId = setTimeout(() => logW(`${lockOwner} cant lock ${this.name}! possible deadlock detected! this.lockOwner=${this.lockOwner}`), 10 * 1000)
            this.timerErrId = setTimeout(() => logE(`${lockOwner} cant lock ${this.name}! deadlock detected! this.lockOwner=${this.lockOwner}`), 60 * 1000)
            this.locked = true
            this.lockOwner = lockOwner
            logD(`${lockOwner} ${this.name} lock complete`)
            resolve()
         }
      })
   }

   release () {
      if (this.queue.length > 0) {
         logD(`${this.lockOwner} release lock ${this.name}. next owners = ${this.queue.map(item => item.lockOwner)}`)
         const [resolve, reject, lockOwner] = this.queue.shift()
         this.lockOwner = lockOwner
         resolve()
      } else {
         logD(`${this.lockOwner} complete lock ${this.name}.`)
         clearTimeout(this.timerWarnId)
         clearTimeout(this.timerErrId)
         this.locked = false
         this.lockOwner = null
      }
   }
}

export { Mutex }
