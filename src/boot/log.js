import * as Sentry from '@sentry/browser'

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

let logD = (...msg) => console.log(...msg)
let logI = (...msg) => console.log(...msg)
let logW = (...msg) => console.warn(...msg)
let logE = (...msg) => console.error(...msg)

class Logger {
  constructor (store) {
    this.store = store
    this.loggerFuncs = {}
    Sentry.init({ dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536' })
  }

  getLoggerFunc (module) {
    if (!this.loggerFuncs[module]) {
      this.loggerFuncs[module] = require('debug')(`[${module}]`)
      this.loggerFuncs[module].enabled = true
    }
    return this.loggerFuncs[module]
  }

  debug (module, ...msg) {
    if (['debug'].includes(this.store.state.core.logLevel)) {
      this.getLoggerFunc(module)(...msg)
      this.store.dispatch('log/debug', ['module', msg], { root: true })
    }
    if (['debug'].includes(this.store.state.core.sentryLogLevel)) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Debug)
  }

  info (module, ...msg) {
    if (['debug', 'info'].includes(this.store.state.core.logLevel)) {
      this.getLoggerFunc(module)(...msg)
      this.store.dispatch('log/info', ['module', msg], { root: true })
    }
    if (['debug', 'info'].includes(this.store.state.core.sentryLogLevel)) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Info)
  }

  warn (module, ...msg) {
    if (['debug', 'info', 'warning', 'warn'].includes(this.store.state.core.logLevel)) {
      this.getLoggerFunc(module)(...msg)
      this.store.dispatch('log/warn', ['module', msg], { root: true })
    }
    if (['debug', 'info', 'warning', 'warn'].includes(this.store.state.core.sentryLogLevel)) Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Warning)
  }

  error (module, ...msg) {
    try {
      this.getLoggerFunc(module)(...msg)
      this.store.dispatch('log/error', ['module', msg], { root: true })
      // Sentry.captureMessage(JSON.stringify(msg), Sentry.Severity.Error)
    } catch (err) {
      console.error('error on logging error!!!', err)
    }
  }
}

export default async ({ Vue, store, app }) => {
  try {
    let logger = new Logger(store)
    let logD = function (...msg) {
      let module = this && this.constructor && this.constructor.name === 'VueComponent' ? this.$options.name : 'unknown module'
      logger.debug(module, ...msg)
    }
    Vue.prototype.$logD = logD
    Vue.prototype.$log = logD
    Vue.prototype.$logI = logI = function (...msg) {
      let module = this && this.constructor && this.constructor.name === 'VueComponent' ? this.$options.name : 'unknown module'
      logger.info(module, ...msg)
    }
    Vue.prototype.$logW = logW = function (...msg) {
      let module = this && this.constructor && this.constructor.name === 'VueComponent' ? this.$options.name : 'unknown module'
      logger.warn(module, ...msg)
    }
    Vue.prototype.$logE = logE = function (...msg) {
      let module = this && this.constructor && this.constructor.name === 'VueComponent' ? this.$options.name : 'unknown module'
      logger.error(module, ...msg)
    }

    Vue.config.errorHandler = function (err, vm, info) {
      if (err) {
        if (err.processed) return
        err.processed = true
      }
      logE(err, info)
    }
    // в продакшене не работает
    Vue.config.warnHandler = function (msg, vm, trace) {
      // logW(`Vue.config.warnHandler: ${msg}\nTrace: ${trace}`)
    }
    // глобальный обработчик ошибок для всего. Сработает только если ОПРЕДЕЛЕНА Vue.config.errorHandler. Это странно...
    window.onerror = function (message, source, line, column, error) {
      if (error) {
        if (error.processed) return
        error.processed = true
      }
      logE('window.onerror', message, source, line, column, error)
    }

    // Sentry.init({
    //   dsn: 'https://63df77b22474455a8b54c63682fcaf61@sentry.io/1838536',
    //   integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: true })]
    // })
    // Sentry.captureMessage('Some messagezzzzz', Sentry.Severity.Debug);
  } catch (err) {
    if (logE) logE(err)
  }
}

export { logD, logI, logW, logE }
