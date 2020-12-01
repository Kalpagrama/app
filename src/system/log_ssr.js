import assert from 'assert'
import 'src/system/utils'
import { LogSystemModulesEnum, LogLevelEnum } from 'src/system/log'

let logSystemModulesValueSet = new Set(Object.values(LogSystemModulesEnum))

const showAlert = false

class Logger {
   constructor (store) {
      this.store = store
      this.loggerFuncs = {}
      // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })
      this.init()
   }

   init () {
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
   return logger
}

export { init }
