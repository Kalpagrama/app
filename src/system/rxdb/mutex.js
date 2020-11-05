import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { wait } from 'src/system/utils'
import { AppVisibility, Platform } from 'quasar'
import Vue from 'vue'

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

   async lock (lockOwner) {
      assert(lockOwner, '!lockOwner')
      return await new Promise((resolve, reject) => {
         logD(`${lockOwner} ${this.name} lock start locked=${this.locked} this.lockOwner=${this.lockOwner} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         if (this.locked) {
            this.queue.push({ resolve, reject, lockOwner })
            logD(`${lockOwner} ${this.name} lock queued!  queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
         } else {
            this.timerWarnId = setInterval(() => logW(`${this.name} possible deadlock! locked by:${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`), 10 * 1000)
            // this.timerErrId = setTimeout(() => {
            //    logE(`${lockOwner} ${this.name} deadlock detected! this.lockOwner=${this.lockOwner} queue:${JSON.stringify(this.queue.map(item => item.lockOwner))}`)
            //    reject(new Error('deadlock detected! reject all locks')) // current
            //    for (let { reject } of this.queue) reject(new Error('deadlock detected! reject all locks')) // queued
            //    this.locked = false
            //    this.queue = []
            // }, 60 * 1000)
            this.locked = true
            this.lockOwner = lockOwner
            logD(`${lockOwner} ${this.name} lock complete`)
            resolve()
         }
      })
   }

   release () {
      assert(this.lockOwner, '!this.lockOwner')
      let lockOwnerOld = this.lockOwner
      if (this.queue.length > 0) {
         const { resolve, reject, lockOwner } = this.queue.shift()
         this.lockOwner = lockOwner
         resolve()
      } else {
         if (this.timerWarnId) clearInterval(this.timerWarnId)
         if (this.timerErrId) clearTimeout(this.timerErrId)
         this.locked = false
         this.lockOwner = null
      }
      logD(`${lockOwnerOld} ${this.name}. release lock complete. this.lockOwner=${this.lockOwner} lockOwnerOld=${lockOwnerOld} queue = ${JSON.stringify(this.queue.map(item => item.lockOwner))} ${this.locked}`)
   }
}

const maxGlobalLockTimeFuse = 1000 * 60 // считаем что операция не может быть дольше минуты

// глобальный (несколько вкладок) мьютекс
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
                     if (to && to.appVisible) thiz.setLeader()
                  }
               }
            }
         })
      }
      // подписываемся на изменение localStorage (Событие НЕ работает на вкладке, которая вносит изменения)
      // upd В сафари событие срабатывает и на вкладке, которая инициировала изменения
      window.addEventListener('storage', async function (event) {
         if (this.lockCnt && event.key && event.key.in('k_global_lock')) { // Мы владели мьютексом, но какая-то вкладка сбросила нас (см maxGlobalLockTimeFuse)
            if (event.newValue) {
               let current = JSON.parse(event.newValue)
               assert(current.instanceId, '!current.instanceId')
               if (current.instanceId !== mutexGlobal.getInstanceId()) {
                  logW('другая вкладка захватила наш мьютекс тк посчитала это дедлоком')
                  window.location.reload()
               }
            } else {
               logW('был сделан hardReset (может даже и нами(в safari - нет возможности узнать это - пожтому делаем reload)')
               window.location.reload()
            }
         }
         if (event.key && event.key.in('k_leader_instance_id')){
            if (!mutexGlobal.isLeader()){
               document.title = document.title.replaceAll('✨', '')
            }
         }
      })
   }

   setLeader () {
      logD('change leader to ', this.instanceId)
      document.title = document.title.replaceAll('✨', '')
      document.title = document.title + '✨'
      localStorage.setItem('k_leader_instance_id', this.instanceId)
   }

   isLeader () {
      if (Platform.is.capacitor) return true
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
      if (Platform.is.capacitor) return
      assert(lockOwner, '!lockOwner')
      const f = this.lock
      logD(f, 'start', lockOwner, this.getInstanceId())
      if (this.unloadingInProgress) throw new Error('cant globalLock (unloadingInProgress)')
      const t1 = performance.now()
      let current = JSON.parse(localStorage.getItem('k_global_lock') || null)
      while (current && current.locked && this.instanceId !== current.instanceId) { // мьютекс захвачен не нами. ждем пока освободится
         // если вкладка, создавшая мьютекс не обновляет его (вкладки уже нет, либо она неактивна)
         if (Date.now() - current.dtActual > 8888) {
            logW(' Мьютекс никто не обновляет слишком долго. Захватываем его принудительно!')
            break
         }
         await wait(500) // ждем пока мьютекс освободится
         current = JSON.parse(localStorage.getItem('k_global_lock') || null)
      }
      // let current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({
      //    dt: 0,
      //    instanceId: '',
      //    lockOwner: ''
      // }))
      // if (this.instanceId !== current.instanceId) {
      //    while (Date.now() - current.dt > 0 && Date.now() - current.dt < maxGlobalLockTimeFuse) {
      //       assert('dt' in current && 'instanceId' in current, 'bad current!')
      //       await wait(500)
      //       if (Date.now() % 4 === 0) logW(f, `${this.instanceId}:${lockOwner} cant globalLock! possible deadlock detected! lockOwner=${JSON.stringify(current)}.  ${Math.ceil((Date.now() - current.dt) / 1000)} sec left`)
      //       current = JSON.parse(localStorage.getItem('k_global_lock') || JSON.stringify({
      //          dt: 0,
      //          instanceId: '',
      //          lockOwner: ''
      //       }))
      //    }
      //    if (current.dt) {
      //       logW(`${this.instanceId}:${lockOwner} break globalLock by timeout(maxGlobalLockTimeFuse) lockOwner=${JSON.stringify(current)}.!`)
      //       localStorage.removeItem('k_global_lock')
      //    }
      // }
      if (!this.lockCnt) {
         localStorage.setItem('k_global_lock', JSON.stringify({
            dt: Date.now(),
            dtActual: Date.now(),
            locked: true,
            instanceId: this.instanceId,
            lockOwner: lockOwner
         }))
         // 2 раза в секунду обновляем актуальность блокировки (типа мы еще живы)
         this.timerActualityId = setInterval(() => {
            // todo
            let current = JSON.parse(localStorage.getItem('k_global_lock') || null)
            if (!current || current.instanceId !== mutexGlobal.getInstanceId()) {
               logW('другая вкладка захватила наш мьютекс тк посчитала это дедлоком')
               window.location.reload()
            } else { // обновляем актуальность блокировки
               current.dtActual = Date.now()
               localStorage.setItem('k_global_lock', JSON.stringify(current))
            }
         }, 500)
      }
      this.lockCnt++
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   async release (unlockOwner) {
      if (Platform.is.capacitor) return
      const f = this.release
      assert(unlockOwner, '!unlockOwner')
      // logD(f, 'start', lockOwner, this.getInstanceId())
      assert(this.lockCnt, '!this.lockCnt')
      this.lockCnt-- // нужно ставить до изменения k_global_lock (см window.addEventListener('storage.k_global_lock')
      if (!this.lockCnt) {
         if (this.timerActualityId) clearInterval(this.timerActualityId)
         let current = JSON.parse(localStorage.getItem('k_global_lock') || null)
         assert('instanceId' in current)
         if (current.instanceId === this.instanceId) { // (мог кто-то перехватить)
            logD(f, 'release globalLock', this.instanceId, current)
            current.locked = false
            localStorage.setItem('k_global_lock', JSON.stringify(current)) // нельзя удалять k_global_lock (см window.addEventListener('storage'... )!
         } else if (current.instanceId) { // кто-то перехватил наш mutex. мы теперь не владеем этим мьютексом
            logW(f, `кто то перехватил наш мьютекс: ${JSON.stringify(current)}`)
         } // такое возможно из-за maxGlobalLockTimeFuse
      }
   }
}

const mutexGlobal = new MutexGlobal()

export { MutexLocal, mutexGlobal }
