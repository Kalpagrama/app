import assert from 'assert'
import 'src/system/utils'

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
Object.freeze(LogSystemModulesEnum)

let logD = (...msg) => console.log(...msg)
let logI = (...msg) => console.log(...msg)
let logW = (...msg) => console.warn(...msg)
let logE = (...msg) => console.error(...msg)
let logC = (...msg) => console.error(...msg)

function getLogFunc (level, module) {
   switch (level) {
      case LogLevelEnum.DEBUG:
         return (...args) => logD.call({ logModuleName: module }, ...args)
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

let performanceSSR = { now: () => Date.now() }
let localStorageSSR, sessionStorageSSR
localStorageSSR = sessionStorageSSR = {
   setItem: (key, value) => {
   },
   getItem: (key) => {
   },
   removeItem: (key) => {
   },
   clear: () => {
   },
   key: (index) => {
   },
   length: 0
}
let windowSSR = {
   location: {
      reload: () => {
      }
   }
}
let documentSSR = {
}

async function initLogger (store) {
   assert(store, '!store')
   let logger
   if (process.env.MODE === 'ssr') {
      const { init } = await import('src/system/log_ssr')
      logger = init(store)
   } else {
      performanceSSR = window.performance
      localStorageSSR = window.localStorage
      sessionStorageSSR = window.sessionStorage
      windowSSR = window
      documentSSR = document
      const { init } = await import('src/system/log_browser')
      logger = init(store)
   }
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
   logD = function (...msg) {
      logger.debug(detectModuleName(this), ...msg)
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
   return { logD, logI, logW, logE, logC }
}

export {
   initLogger,
   getLogFunc,
   LogLevelEnum,
   LogSystemModulesEnum,
   performanceSSR as performance,
   localStorageSSR as localStorage,
   sessionStorageSSR as sessionStorage,
   windowSSR as window,
   documentSSR as document
}
