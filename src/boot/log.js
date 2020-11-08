import assert from 'assert'
import 'src/system/utils' // Object.assign...

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

// let pino = require('pino')({browser: {asObject: false}})

const LogLevelEnum = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4
})
Object.freeze(LogLevelEnum)
const LogSystemModulesEnum = Object.freeze({
  SYSTEM: 'sys',
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
let logSystemModulesValueSet = new Set(Object.values(LogSystemModulesEnum))
Object.freeze(LogSystemModulesEnum)

const showAlert = false

class Logger {
  constructor(store) {
    this.store = store
    this.loggerFuncs = {}
    // Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })
    let logLevel = sessionStorage.getItem('k_log_level')
    let logFormat = JSON.parse(sessionStorage.getItem('k_log_format'))
    let logDbgFilter = sessionStorage.getItem('k_log_filter')
    assert(logLevel && logFormat && logDbgFilter, '!this.logLevel && this.logFormat && this.logDbgFilter')
    this.store.commit('core/stateSet', ['logLevel', parseInt(logLevel)])
    this.store.commit('core/stateSet', ['logDbgFilter', logDbgFilter])
    this.store.commit('core/stateSet', ['logFormat', logFormat])
  }

  randomInteger(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  // создаст для каждого модуля свою ф-ю
  getLoggerFunc(module) {
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

  prepareParams(module, msg) { // #69f542
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
      msg.splice(0, 1, `[${func.name || func.nameExtra}]`)
    }
    assert(module, '!module')
    msg.splice(0, 0, `%c[${module}] ${this.store.state.core.logFormat.time ? (new Date()).toLocaleTimeString() : ''}`, `color: ${module.toColor()}; font-style: italic; padding: 2px;`)
  }

  showAlert(msg) {
    let func = null
    let message = msg[0]
    if (msg.length && typeof msg[0] === 'function') {
      message = msg[1]
    }
    alert('ERR! \n' + JSON.stringify(message))
  }

  debug(module, ...msg) {
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

  info(module, ...msg) {
    if (LogLevelEnum.INFO >= this.store.state.core.logLevel) {
      this.prepareParams(module, msg)
      console.info(...msg)
      // this.getLoggerFunc(module)(...msg)
    }
    if (LogLevelEnum.INFO >= this.store.state.core.logLevelSentry) {
      // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Info)
    }
  }

  warn(module, ...msg) {
    if (LogLevelEnum.WARNING >= this.store.state.core.logLevel) {
      this.prepareParams(module, msg)
      console.warn(...msg)
      // this.getLoggerFunc(module)(...msg)
    }
    if (LogLevelEnum.WARNING >= this.store.state.core.logLevelSentry) {
      // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Warning)
    }
  }

  error(module, ...msg) {
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

  critical(module, ...msg) {
    try {
      if (showAlert) this.showAlert(msg)
      let reload = confirm('critical error: ' + JSON.stringify(...msg) + '\n\nReload page?')
      if (reload) window.location.reload()
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
let logI = (...msg) => console.log(...msg)
let logW = (...msg) => console.warn(...msg)
let logE = (...msg) => console.error(...msg)
let logC = (...msg) => console.error(...msg)

function getLogFunc(level, module) {
  switch (level) {
    case LogLevelEnum.DEBUG:
      return (...args) => logD.call({logModuleName: module}, ...args)
    case LogLevelEnum.INFO:
      return (...args) => logI.call({logModuleName: module}, ...args)
    case LogLevelEnum.WARNING:
      return (...args) => logW.call({logModuleName: module}, ...args)
    case LogLevelEnum.ERROR:
      return (...args) => logE.call({logModuleName: module}, ...args)
    case LogLevelEnum.CRITICAL:
      return (...args) => logC.call({logModuleName: module}, ...args)
    default:
      return (...args) => logD.call({logModuleName: module}, ...args)
  }
}

export default async ({Vue, store, app}) => {
  try {
    // import { initSessionStorage } from 'src/system/services'
    await require('src/system/services').initSessionStorage()
    // await initSessionStorage()
    const detectModuleName = (thiz) => {
      if (thiz && thiz.logModuleName) {
        return thiz.logModuleName
      } else if (thiz && thiz.constructor && thiz.constructor.name === 'VueComponent') {
        let res = thiz.$options.name
        // if (thiz.$attrs.index !== undefined) res += `--${thiz.$attrs.index}`
        // res += `--${thiz.$props.index}`
        return res
      } else {
        return 'unknown module'
      }
    }
    let logger = new Logger(store)
    Vue.prototype.$log = Vue.prototype.$logD = logD = function (...msg) {
      logger.debug(detectModuleName(this), ...msg)
    }
    Vue.prototype.$logI = logI = function (...msg) {
      logger.info(detectModuleName(this), ...msg)
    }
    Vue.prototype.$logW = logW = function (...msg) {
      logger.warn(detectModuleName(this), ...msg)
    }
    Vue.prototype.$logE = logE = function (...msg) {
      logger.error(detectModuleName(this), ...msg)
    }
    Vue.prototype.$logC = logC = function (...msg) {
      logger.critical(detectModuleName(this), ...msg)
    }
    Vue.config.errorHandler = function (err, vm, info) {
      // console.log('Vue.config.errorHandler')
      if (err) {
        if (err.processed) return
        err.processed = true
      }
      try {
        logE(err, info)
        // const { clearCache } = require('src/system/services')
        // clearCache() нельзя очищать кэш просто на всякий случай! (там могут быть несохраненные изменения в мастерской)
      } catch (e) {
        console.error(e, info)
      }
    }
    // в продакшене не работает
    Vue.config.warnHandler = function (msg, vm, trace) {
      // logW(`Vue.config.warnHandler: ${msg}\nTrace: ${trace}`)
    }
    // глобальный обработчик ошибок для всего. Сработает только если ОПРЕДЕЛЕНА Vue.config.errorHandler. Это странно...
    window.onerror = function (message, source, line, column, error) {
      console.log('window.onerror')
      if (error) {
        if (error.processed) return
        error.processed = true
      }
      try {
        if (error && error.message === 'Failed to execute \'getComputedStyle\' on \'Window\': parameter 1 is not of type \'Element\'.') {
          logW('window.onerror', message, source, line, column, error)
        } else {
          logE('window.onerror', message, source, line, column, error)
        }
      } catch (e) {
        console.error(e)
      }
    }
  } catch (err) {
    if (logE) logE(err)
  }
}

export {getLogFunc, LogLevelEnum, LogSystemModulesEnum}
