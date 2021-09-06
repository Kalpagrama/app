import { LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'

export default {
   initialized: false,
   name: 'Kalpagrama',
   version: process.env.BUILD_VERSION,
   buildDate: process.env.BUILD_DATE,
   online: true, // если сеть недоступна - присваивается false
   newVersionAvailable: false,
   installPrompt: null, // ф-я вызова диалога "установить приложение"
   logLevel: LogLevelEnum.DEBUG,
   logLevelSentry: LogLevelEnum.CRITICAL,
   logDbgFilter: 'any', // gui | system | any
   logFormat: {time: false, moduleName: true, funcName: true},
   logRocket: false,
   logRocketSessionUrl: null,
   logDbgModulesBlackList: [
      LogSystemModulesEnum.SYSTEM,
      LogSystemModulesEnum.TEST,
      LogSystemModulesEnum.SW,
      LogSystemModulesEnum.PWA,
      LogSystemModulesEnum.AUTH,
      LogSystemModulesEnum.API,
      LogSystemModulesEnum.ROUTER,
      LogSystemModulesEnum.VUEX,
      LogSystemModulesEnum.VUEX_CACHE,
      LogSystemModulesEnum.VUEX_CORE,
      LogSystemModulesEnum.VUEX_DBG,
      LogSystemModulesEnum.RXDB,
      // LogSystemModulesEnum.RXDB_REACTIVE,
      // LogSystemModulesEnum.RXDB_WS,
      LogSystemModulesEnum.RXDB_CACHE,
      LogSystemModulesEnum.RXDB_OBJ,
      LogSystemModulesEnum.RXDB_GQL,
      LogSystemModulesEnum.RXDB_LST,
      LogSystemModulesEnum.RXDB_EVENT,
      LogSystemModulesEnum.MUTEX,
      LogSystemModulesEnum.BOOT,
      LogSystemModulesEnum.CP,
   ],
   colors: {
      hello: 'goodbye'
   },
   count: 0,
   progressInfo: {
      UPLOAD: {}, // {oid: progress, oid: progress}
      CREATE: {} // {oid: progress, oid: progress}
   }
}
