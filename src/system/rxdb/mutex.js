import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { wait } from 'src/system/utils'
import { AppVisibility } from 'quasar'
import Vue from 'vue'
import { router } from 'src/boot/main'
import { rxdb } from 'src/system/rxdb/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

// локальный мьютекс с соблюдением очереди захвата
class MutexLocal {
   constructor (name) {
      assert(name, 'name')
      this.queue = []
      this.locked = false
      this.lockOwner = null
      this.name = name
      this.timerWarnId = null
      this.timerErrId = null
   }

   // tryLock (lockOwner) {
   //    assert(lockOwner, '!lockOwner')
   //    if (!this.locked) {
   //       return true
   //    } else return false
   // }

   async lock (lockOwner) {
      assert(lockOwner, '!lockOwner')
      return await new Promise((resolve, reject) => {
         logD(`${lockOwner} ${this.name} lock start locked=${this.locked} this.lockOwner=${this.lockOwner} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         if (this.locked) {
            this.queue.push({ resolve, reject, lockOwner })
            logD(`${lockOwner} ${this.name} lock queued!  queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         } else {
            this.timerWarnId = setTimeout(() => logW(`${lockOwner} ${this.name} possible deadlock detected! this.lockOwner=${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`), 10 * 1000)
            this.timerErrId = setTimeout(() => {
               logE(`${lockOwner} ${this.name} deadlock detected! this.lockOwner=${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
               reject(new Error('deadlock detected! reject all locks')) // current
               for (let { reject } of this.queue) reject(new Error('deadlock detected! reject all locks')) // queued
               this.locked = false
               this.queue = []
            }, 60 * 1000)
            this.locked = true
            this.lockOwner = lockOwner
            logD(`${lockOwner} ${this.name} lock complete`)
            resolve()
         }
      })
   }

   release () {
      let lockOwnerOld = this.lockOwner
      if (this.queue.length > 0) {
         const { resolve, reject, lockOwner } = this.queue.shift()
         this.lockOwner = lockOwner
         resolve()
      } else {
         clearTimeout(this.timerWarnId)
         clearTimeout(this.timerErrId)
         this.locked = false
         this.lockOwner = null
      }
      logD(`${lockOwnerOld} ${this.name}. release lock complete. this.lockOwner=${this.lockOwner} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))} ${this.locked}`)
   }
}

const maxGlobalLockTimeFuse = 1000 * 60 // считаем что операция не может быть дольше минуты

// глобальный (несколько вкладок) мьютекс без очереди захвата (кто успел - того и тапки)
// синглтон (один экземпляр на приложение)
class MutexGlobal {
   constructor () {
      this.queue = []
      this.lockCnt = 0 //  мьютекс по умолчанию рекурсивен
      this.instanceId = sessionStorage.getItem('k_instance_id') ? sessionStorage.getItem('k_instance_id') : (Math.ceil(Math.random() * Date.now())).toString()
      sessionStorage.removeItem('k_instance_id') // контроль дублирования (при удблированиии вкладок дублируется sessionStorage) https://stackoverflow.com/questions/11896160/any-way-to-identify-browser-tab-in-javascript
      this.unloadingInProgress = false
      window.addEventListener('beforeunload', () => {
         logD('on page unload')
         this.unloadingInProgress = true
         sessionStorage.setItem('k_instance_id', this.instanceId) // запоминаем instanceId (хранится в сторадж только тогда когда вкладка закрыта (иначе при дублировании вкладки - дублируется и instanceId))
         let currentLock = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({
            dt: 0,
            instanceId: ''
         }))
         if (currentLock.instanceId === this.instanceId) {
            localStorage.removeItem('k_global_lock') // если что то блокировали - снимаем блокировку
         }
      })
      { // leader detection
         // отслеживание открыта ли вкладка
         const thiz = this
         let vm = new Vue({
            data: {
               appVisibility: AppVisibility
            },
            watch: {
               appVisibility: {
                  deep: true,
                  immediate: true,
                  async handler (to, from) {
                     assert(to, '!to!')
                     // logD(`appVisibility changed! from:${from ? from.appVisible : false} to: ${to.appVisible}`)
                     if (to && to.appVisible && !thiz.isLeader()) thiz.setLeader()
                  }
               }
            }
         })
      }
      window.addEventListener('storage', async function (event) {
         if (this.lockCnt && event.key && event.key.in('k_global_lock')) { // Мы владели мьютексом, но какая-то вкладка сбросила нас (см maxGlobalLockTimeFuse)
            logW('другая вкладка сбросила наш мьютекс тк посчитала это дедлоком')
            window.location.reload()
         }
      })
   }

   setLeader () {
      logD('change leader to ', this.instanceId)
      localStorage.setItem('k_leader_instance_id', this.instanceId)
   }

   isLeader () {
      let currentLeaderInstanceId = localStorage.getItem('k_leader_instance_id')
      if (!currentLeaderInstanceId) {
         this.setLeader()
         currentLeaderInstanceId = this.instanceId
      }
      return currentLeaderInstanceId === this.instanceId
   }

   getInstanceId () {
      return this.instanceId
   }

   async lock (lockOwner) {
      assert(lockOwner, '!lockOwner')
      const f = this.lock
      // logD(f, 'start', lockOwner, this.getInstanceId())
      if (this.unloadingInProgress) {
         logW('cant globalLock (unloadingInProgress)')
         await wait(10 * 1000)
      }
      const t1 = performance.now()
      let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({
         dt: 0,
         instanceId: '',
         lockOwner: ''
      }))
      if (this.instanceId !== current.instanceId) {
         while (Date.now() - current.dt > 0 && Date.now() - current.dt < maxGlobalLockTimeFuse) {
            assert('dt' in current && 'instanceId' in current, 'bad current!')
            await wait(500)
            if (Date.now() % 4 === 0) logW(f, `${this.instanceId}:${lockOwner} cant globalLock! possible deadlock detected! lockOwner=${JSON.stringify(current)}.  ${Math.ceil((Date.now() - current.dt) / 1000)} sec left`)
            current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({
               dt: 0,
               instanceId: '',
               lockOwner: ''
            }))
         }
         if (current.dt) {
            logW(`${this.instanceId}:${lockOwner} break globalLock by timeout(maxGlobalLockTimeFuse) lockOwner=${JSON.stringify(current)}.!`)
            localStorage.removeItem('k_global_lock')
         }
      }
      localStorage.setItem('k_global_lock', JSON.stringify({
         dt: Date.now(),
         instanceId: this.instanceId,
         lockOwner: lockOwner
      }))
      this.lockCnt++
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   release (lockOwner) {
      const f = this.release
      assert(lockOwner, '!lockOwner')
      // logD(f, 'start', lockOwner, this.getInstanceId())
      assert(this.lockCnt, '!this.lockCnt')
      this.lockCnt-- // нужно ставить до изменения k_global_lock (см window.addEventListener('storage.k_global_lock')
      if (!this.lockCnt) {
         let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({ dt: 0, instanceId: '' }))
         assert('dt' in current && 'instanceId' in current)
         if (current.instanceId === this.instanceId) { // если это мы захватывали
            logD(f, 'release globalLock', this.instanceId, current)
            localStorage.removeItem('k_global_lock')
         } else if (current.instanceId) { // кто-то перехватил наш mutex по тамауту maxGlobalLockTimeFuse. мы теперь не владеем этим мьютексом
            logW(f, `release foreign(external) globalLock  (${current.instanceId}) lock while work is not complete. maybe work is too heavy`)
         } // такое возможно из-за maxGlobalLockTimeFuse
      }
   }
}

const mutexGlobal = new MutexGlobal()

export { MutexLocal, mutexGlobal }
