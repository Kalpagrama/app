// import 'src/system/common/utils'
import { wait, assert } from 'src/system/common/utils'

// чтобы JSON.stringify() нормально ошибки переваривал (stringify понимает только enumerable props)
if (!('toJSON' in Error.prototype)) {
   // eslint-disable-next-line no-extend-native
   Object.defineProperty(Error.prototype, 'toJSON', {
      value: function () {
         let alt = {}

         Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key]
         }, this)

         return alt
      },
      configurable: true,
      writable: true
   })
}
const performance = window.performance
const LogLevelEnum = Object.freeze({
   DEBUG_RAW: 0,
   DEBUG: 1, // (с учетом logDbgModulesFilter)
   TRACE: 2, // профилирование | замеры производительности (с учетом logDbgModulesFilter)
   INFO: 3,
   WARNING: 4,
   ERROR: 5,
   CRITICAL: 6
})
Object.freeze(LogLevelEnum)
const LogSystemModulesEnum = Object.freeze({
   SYSTEM: 'sys',
   TESTS: 'tst',
   SW: 'sw',
   PWA: 'pwa',
   AUTH: 'auth',
   API: 'api',
   ROUTER: 'rtr',
   VUEX: 'vx',
   VUEX_CACHE: 'vx_cache',
   VUEX_CORE: 'vx_core',
   VUEX_DBG: 'vx_core',
   RXDB: 'rxdb',
   RXDB_REACTIVE: 'rxdb_reactive',
   RXDB_WS: 'rxdb_ws',
   RXDB_CACHE: 'rxdb_cache',
   RXDB_OBJ: 'rxdb_obj',
   RXDB_GQL: 'rxdb_gql',
   RXDB_LST: 'rxdb_lst',
   RXDB_EVENT: 'rxdb_ev',
   MUTEX: 'mutex',
   BOOT: 'boot',
   CP: 'capacitor'
})
Object.freeze(LogSystemModulesEnum)
let logSystemModulesValueSet = new Set(Object.values(LogSystemModulesEnum))
const showAlert = false

class Logger {
   constructor (store) {
      this.store = store
      this.loggerFuncs = {}
      // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })
      this.init()
      window.addEventListener('storage', async (event) => {
         if (event.key && event.key.in('k_log_level', 'k_log_format', 'k_log_filter')) {
            this.init()
         }
      })
   }

   init () {
      {
         // init
         if (!sessionStorage.getItem('k_log_format')) {
            sessionStorage.setItem('k_log_format', JSON.stringify({
               time: false,
               moduleName: true,
               funcName: true
            }))
         }
         if (!sessionStorage.getItem('k_log_level')) {
            if (process.env.NODE_ENV === 'development') sessionStorage.setItem('k_log_level', LogLevelEnum.DEBUG)
            else sessionStorage.setItem('k_log_level', LogLevelEnum.WARNING)
         }
         if (!sessionStorage.getItem('k_log_filter')) sessionStorage.setItem('k_log_filter', 'any')
      }
      let logLevel = sessionStorage.getItem('k_log_level')
      let logFormat = JSON.parse(sessionStorage.getItem('k_log_format'))
      let logDbgFilter = sessionStorage.getItem('k_log_filter')
      assert(logLevel && logFormat && logDbgFilter, '!this.logLevel && this.logFormat && this.logDbgFilter')
      this.store.commit('core/stateSet', ['logLevel', parseInt(logLevel)])
      this.store.commit('core/stateSet', ['logDbgFilter', logDbgFilter])
      this.store.commit('core/stateSet', ['logFormat', logFormat])
   }

   randomInteger (min, max) {
      // получить случайное число от (min-0.5) до (max+0.5)
      let rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
   }

   // создаст для каждого модуля свою ф-ю
   getLoggerFunc (module) {
      let loggerModule
      loggerModule = this.loggerFuncs[module]
      if (!loggerModule) {
         // loggerModule = require('debug')(`[${module}]`)
         // loggerModule.enabled = true
         // loggerModule = require('pino')({browser: {nestedKey: 'payload', name: 'WERTY', asObject: false}})
         // this.loggerFuncs[module] = loggerModule
      }
      return loggerModule
   }

   prepareParams (module, msg) { // #69f542
      if (!msg) return
      if (this.store.state.core.logFormat.funcName && msg[0] && (typeof msg[0] === 'function' || msg[0].nameExtra)) {
         let func = msg[0]
         msg.splice(0, 1, `[${func.nameExtra || func.name}]`)
      }
      assert(module, '!module')
      msg.splice(0, 0, `%c[${module}] ${this.store.state.core.logFormat.time ? (new Date()).toLocaleTimeString() : ''}`, `color: ${module.toColor()}; font-style: italic; padding: 2px;`)
   }

   showAlert (msg) {
      let func = null
      let message = msg[0]
      if (msg.length && typeof msg[0] === 'function') {
         message = msg[1]
      }
      alert('ERR! \n' + JSON.stringify(message))
   }

   debug (module, ...msg) {
      assert(['gui', 'any', 'sys'].includes(this.store.state.core.logDbgFilter))
      if (this.store.state.core.logDbgFilter === 'gui' && logSystemModulesValueSet.has(module)) return
      if (this.store.state.core.logDbgFilter === 'sys' && !logSystemModulesValueSet.has(module)) return
      if (this.store.state.core.logLevel !== LogLevelEnum.DEBUG_RAW &&
         this.store.state.core.logDbgModulesFilter[module] !== undefined &&
         this.store.state.core.logDbgModulesFilter[module] > LogLevelEnum.DEBUG) return
      if (LogLevelEnum.DEBUG >= this.store.state.core.logLevel) {
         this.prepareParams(module, msg)
         console.log(...msg)
         // this.getLoggerFunc(module, null)(...msg)
      }
      if (LogLevelEnum.DEBUG >= this.store.state.core.logLevelSentry) {
         // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
      }
   }

   trace (module, ...msg) {
      assert(['gui', 'any', 'sys'].includes(this.store.state.core.logDbgFilter))
      if (this.store.state.core.logDbgFilter === 'gui' && logSystemModulesValueSet.has(module)) return
      if (this.store.state.core.logDbgFilter === 'sys' && !logSystemModulesValueSet.has(module)) return
      if (this.store.state.core.logDbgModulesFilter[module] !== undefined && this.store.state.core.logDbgModulesFilter[module] > LogLevelEnum.TRACE) return
      if (LogLevelEnum.TRACE >= this.store.state.core.logLevel) {
         this.prepareParams(module, msg)
         console.log(...msg)
         // this.getLoggerFunc(module, null)(...msg)
      }
      if (LogLevelEnum.TRACE >= this.store.state.core.logLevelSentry) {
         // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
      }
   }

   info (module, ...msg) {
      if (LogLevelEnum.INFO >= this.store.state.core.logLevel) {
         this.prepareParams(module, msg)
         console.info(...msg)
         // this.getLoggerFunc(module)(...msg)
      }
      if (LogLevelEnum.INFO >= this.store.state.core.logLevelSentry) {
         // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Info)
      }
   }

   warn (module, ...msg) {
      if (LogLevelEnum.WARNING >= this.store.state.core.logLevel) {
         this.prepareParams(module, msg)
         console.warn(...msg)
         // this.getLoggerFunc(module)(...msg)
      }
      if (LogLevelEnum.WARNING >= this.store.state.core.logLevelSentry) {
         // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Warning)
      }
   }

   error (module, ...msg) {
      try {
         if (showAlert) this.showAlert(msg)
         if (LogLevelEnum.ERROR >= this.store.state.core.logLevel) {
            this.prepareParams(module, msg)
            console.error(...msg)
            // this.getLoggerFunc(module)(...msg)
         }
         if (LogLevelEnum.ERROR >= this.store.state.core.logLevelSentry) {
            // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
         }
      } catch (err) {
         console.error('error on logging error!!!', err)
         if (showAlert) alert('error on log error! \n' + JSON.stringify(err))
      }
   }

   critical (module, ...msg) {
      try {
         if (showAlert) this.showAlert(msg)
         let reload = confirm('critical error: ' + JSON.stringify(...msg) + '\n\nReload page?')
         if (reload) {
            console.warn('logger::before reload')
            window.location.reload()
         }
         if (LogLevelEnum.CRITICAL >= this.store.state.core.logLevel) {
            this.prepareParams(msg)
            console.error(...msg)
            // this.getLoggerFunc(module)(...msg)
         }
         if (LogLevelEnum.CRITICAL >= this.store.state.core.logLevelSentry) {
            // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Critical)
         }
      } catch (err) {
         console.error('error on logging error!!!', err)
         if (showAlert) alert('error on log error! \n' + JSON.stringify(err))
      }
   }
}

let logD = (...msg) => console.log(...msg)
let logT = (...msg) => console.log(...msg)
let logI = (...msg) => console.log(...msg)
let logW = (...msg) => console.warn(...msg)
let logE = (...msg) => console.error(...msg)
let logC = (...msg) => console.error(...msg)

function getLogFunc (level, module) {
   switch (level) {
      case LogLevelEnum.DEBUG:
         return (...args) => logD.call({ logModuleName: module }, ...args)
      case LogLevelEnum.TRACE:
         return (...args) => logT.call({ logModuleName: module }, ...args)
      case LogLevelEnum.INFO:
         return (...args) => logI.call({ logModuleName: module }, ...args)
      case LogLevelEnum.WARNING:
         return (...args) => logW.call({ logModuleName: module }, ...args)
      case LogLevelEnum.ERROR:
         return (...args) => logE.call({ logModuleName: module }, ...args)
      case LogLevelEnum.CRITICAL:
         return (...args) => logC.call({ logModuleName: module }, ...args)
      default:
         return (...args) => logD.call({ logModuleName: module }, ...args)
   }
}

class Storage {
   constructor () {
      this.storage = {}
   }

   setItem (key, value) {
      this.storage[key] = value
   }

   getItem (key) {
      return this.storage[key]
   }

   removeItem (key) {
      delete this.storage[key]
   }

   clear () {
      this.storage = {}
   }

   key (index) {
      throw new Error('not impl')
   }
}

async function initLogger (store) {
   assert(store, '!store')
   let logger = new Logger(store)
   // глобальный обработчик ошибок для всего. Сработает только если ОПРЕДЕЛЕНА Vue.config.errorHandler. Это странно...
   window.onerror = function (message, source, line, column, error) {
      // console.log('window.onerror')
      if (error) {
         if (error.processed) return
         error.processed = true
      }
      if (error && error.message === 'Failed to execute \'getComputedStyle\' on \'Window\': parameter 1 is not of type \'Element\'.') {
         console.warn('window.onerror: ', message, source, line, column, error)
      } else if (message === 'ResizeObserver loop limit exceeded') {
         // console.warn('window.onerror: ', message, source, line, column, error)
      } else {
         console.error('window.onerror: ', message, source, line, column, error)
      }
   }

   const detectModuleName = (thiz) => {
      // console.log('detectModuleName', thiz)
      if (thiz && thiz.logModuleName) return thiz.logModuleName
      else return thiz?.$options?.name || 'unknown module'
   }
   logD = function (...msg) {
      logger.debug(detectModuleName(this), ...msg)
   }
   logT = function (...msg) {
      logger.trace(detectModuleName(this), ...msg)
   }
   logI = function (...msg) {
      logger.info(detectModuleName(this), ...msg)
   }
   logW = function (...msg) {
      logger.warn(detectModuleName(this), ...msg)
   }
   logE = function (...msg) {
      logger.error(detectModuleName(this), ...msg)
   }
   logC = function (...msg) {
      logger.critical(detectModuleName(this), ...msg)
   }
   return { logD, logT, logI, logW, logE, logC }
}

async function initLogRocket (oidUser, username, userEmail, issueDescription, store) {
   // const LogRocket = require('logrocket')
   // LogRocket.init('qdibsv/kalpa-main')
   // // await wait(500)
   // // if (LogRocket.startNewSession && LogRocket.sessionURL) {
   // //    LogRocket.startNewSession()
   // //    await wait(2000)
   // // }
   // LogRocket.identify(oidUser, {
   //    name: (username || userEmail),
   //    email: userEmail,
   //    // Add your own custom user variables here, ie:
   //    ['descr::' + (new Date()).toLocaleString()]: issueDescription
   //    // issueDescription
   // })
   // LogRocket.getSessionURL(sessionURL => {
   //    store.commit('core/stateSet', ['logRocketSessionUrl', sessionURL])
   // });
}

export {
   initLogger,
   initLogRocket,
   getLogFunc,
   LogLevelEnum,
   performance,
   LogSystemModulesEnum
}
