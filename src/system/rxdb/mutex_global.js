import { assert, wait } from 'src/system/common/utils'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
import { AppVisibility, Platform } from 'quasar'
import Vue from 'vue'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.MUTEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.MUTEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.MUTEX)

const actualLockUpdateInterval = 500 // интервал обновления статуса активной блокировки

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
         if (this.lockCnt && event.key && event.key.in('k_global_lock')) { // Мы владели мьютексом, но какая-то вкладка сбросила нас
            if (event.newValue) {
               let current = JSON.parse(event.newValue)
               assert(current.instanceId, '!current.instanceId')
               if (current.instanceId !== mutexGlobal.getInstanceId()) {
                  logW('другая вкладка захватила наш мьютекс тк посчитала это дедлоком. before reload', current.instanceId, mutexGlobal.getInstanceId())
                  // alert('другая вкладка стала лидером принудительно и захватила управление(0).\nReload required!')
                  window.location.reload() // не мжем дальше выполняться. Нас прервала другая вкладка!
               }
            } else {
               logW('был сделан hardReset (может даже и нами(в safari - нет возможности узнать это - пожтому делаем reload)')
               // alert('был сделан hardReset.\nReload required!')
               window.location.reload() // не мжем дальше выполняться. Нас прервала другая вкладка!
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
         if (Date.now() - current.dtActual > actualLockUpdateInterval * 8) {
            logW(' Мьютекс никто не обновляет слишком долго. Захватываем его принудительно!')
            break
         }
         await wait(actualLockUpdateInterval / 2) // ждем пока мьютекс освободится
         current = JSON.parse(localStorage.getItem('k_global_lock') || null)
      }
      if (!this.lockCnt) {
         localStorage.setItem('k_global_lock', JSON.stringify({
            dt: Date.now(),
            dtActual: Date.now(),
            locked: true,
            instanceId: this.instanceId,
            lockOwner: lockOwner
         }))
         // периодически обновляем актуальность блокировки (типа мы еще живы)
         this.timerActualityId = setInterval(() => {
            // todo
            let current = JSON.parse(localStorage.getItem('k_global_lock') || null)
            if (!current || current.instanceId !== mutexGlobal.getInstanceId()) {
               logW('другая вкладка захватила наш мьютекс тк посчитала это дедлоком. current k_global_lock=', current, mutexGlobal.getInstanceId())
               // alert('другая вкладка стала лидером принудительно и захватила управление(1). \n Reload required!')
               window.location.reload() // не мжем дальше выполняться. Нас прервала другая вкладка!
            } else { // обновляем актуальность блокировки
               current.dtActual = Date.now()
               localStorage.setItem('k_global_lock', JSON.stringify(current))
            }
         }, actualLockUpdateInterval)
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
         if (current && current.instanceId === this.instanceId) {
            logD(f, 'release globalLock', this.instanceId, current)
            current.locked = false
            localStorage.setItem('k_global_lock', JSON.stringify(current)) // нельзя удалять k_global_lock (см window.addEventListener('storage'... )!
         } else { // кто-то перехватил наш mutex. мы теперь не владеем этим мьютексом
            logW(f, `кто то перехватил наш мьютекс: ${JSON.stringify(current)}   window.location.reload...`)
            // alert('кто то перехватил наш мьютекс. \n Reload required!')
            window.location.reload() // не мжем дальше выполняться. Нас прервала другая вкладка!
         }
      }
   }
}

const mutexGlobal = new MutexGlobal()

export { mutexGlobal }
