import { assert, wait } from 'src/system/utils'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AppVisibility, Platform } from 'quasar'
import Vue from 'vue'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

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
                  logW('другая вкладка захватила наш мьютекс тк посчитала это дедлоком. before reload')
                  let reload = confirm('другая вкладка захватила наш мьютекс тк посчитала это дедлоком. \n Reload?')
                  if (reload) window.location.reload()
               }
            } else {
               logW('был сделан hardReset (может даже и нами(в safari - нет возможности узнать это - пожтому делаем reload)')
               let reload = confirm('был сделан hardReset (может даже и нами(в safari - нет возможности узнать это. \n Reload?')
               if (reload) window.location.reload()
            }
         }
         if (event.key && event.key.in('k_leader_instance_id')) {
            if (!mutexGlobal.isLeader()) {
               // logW('document.title=', document.title)
               if (document.title && typeof document.title === 'string') document.title = document.title.replace('✨', '')
            }
         }
      })
   }

   setLeader () {
      logD('change leader to ', this.instanceId)
      // logW('document.title=', document.title)
      if (document.title && typeof document.title === 'string') {
         document.title = document.title.replace('✨', '')
         document.title = document.title + '✨'
      }
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
      for (let i = 0; this.unloadingInProgress && i < 10; i++) await wait(200) // ждем 2 сек
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
               let reload = confirm('другая вкладка захватила наш мьютекс тк посчитала это дедлоком(2). \n Reload?')
               if (reload) window.location.reload()
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

export { mutexGlobal }
