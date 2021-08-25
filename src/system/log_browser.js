// eslint-disable-next-line import/no-duplicates
import {assert} from 'src/system/utils'
// eslint-disable-next-line import/no-duplicates
import 'src/system/utils'
import { LogSystemModulesEnum, LogLevelEnum, sessionStorage } from 'src/system/log'

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
      // let func = null
      // if (msg.length && typeof msg[0] === 'function') {
      //   func = msg[0]
      //   if (highlightColor) msg.splice(0, 1, `%c[${func.name || func.nameExtra}]`, `background: ${highlightColor}; color: ${textColor}`, (new Date()).toLocaleTimeString())
      //   else msg.splice(0, 1, `%c[${func.name || func.nameExtra}]`, 'color: #bada55', (new Date()).toLocaleTimeString())
      // } else if (highlightColor) {
      //   msg.splice(0, 0, `%c[${'______'}]`, `background: ${highlightColor}; color: ${textColor}`, (new Date()).toLocaleTimeString())
      // }
      if (!msg) return
      let func = null
      if (this.store.state.core.logFormat.funcName && msg.length && typeof msg[0] === 'function') {
         func = msg[0]
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
      if (this.store.state.core.logDbgModulesBlackList.includes(module)) return
      if (LogLevelEnum.DEBUG >= this.store.state.core.logLevel) {
         this.prepareParams(module, msg)
         console.log(...msg)
         // this.getLoggerFunc(module, null)(...msg)
      }
      if (LogLevelEnum.DEBUG >= this.store.state.core.logLevelSentry) {
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

function init (store) {
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
   return logger
}

export { init }
