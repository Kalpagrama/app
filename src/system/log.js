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
   TEST: 'test',
   SW: 'sw',
   PWA: 'pwa',
   SSR: 'ssr',
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

let isSsr = process.env.MODE === 'ssr'
let performanceSSR = { now: () => Date.now() }
let localStorageSSR, sessionStorageSSR

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

localStorageSSR = sessionStorageSSR = new Storage()
let windowSSR = {
   location: {
      reload: () => {
      }
   }
}
let documentSSR = {}

async function initLogger (store, ssrContext) {
   assert(store, '!store')
   let isSsrServerSide = !!ssrContext
   isSsr = (process.env.MODE === 'ssr') // && isSsrServerSide
   logD('boot::log::isSsr=', isSsr)
   logD('boot::log::isSsrServerSide=', isSsrServerSide)
   let logger
   if (isSsr) {
      const { init } = await import('src/system/log_ssr')
      logger = init(store)
   } else {
      // alert('isSsr=' + JSON.stringify(isSsr))
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

async function initLogRocket(oidUser, username, userEmail, issueDescription, store) {
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
   LogSystemModulesEnum,
   isSsr,
   performanceSSR as performance,
   localStorageSSR as localStorage,
   sessionStorageSSR as sessionStorage,
   windowSSR as window,
   documentSSR as document
}
