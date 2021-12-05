import { LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'

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
   logFormat: {time: false, moduleName: true, funcName: true},
   logRocket: false,
   logRocketSessionUrl: null,
   logDbgFilter: 'any', // gui | system | any
   logDbgModulesFilter: {
      [LogSystemModulesEnum.TESTS]: LogLevelEnum.DEBUG,
      [LogSystemModulesEnum.SYSTEM]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.SW]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.PWA]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.AUTH]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.API]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.ROUTER]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.VUEX]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.VUEX_CACHE]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.VUEX_CORE]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.VUEX_DBG]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_REACTIVE]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_WS]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_CACHE]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_OBJ]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_GQL]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_LST]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_EVENT]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.MUTEX]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.BOOT]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.CP]: LogLevelEnum.TRACE,
   },
   colors: {
      hello: 'goodbye'
   },
   count: 0,
   wsReady: false // мастерской можно пользоваться (она загрузилась и свободна)
}
