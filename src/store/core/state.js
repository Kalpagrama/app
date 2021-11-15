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
   logModulesFilter: {
      [LogSystemModulesEnum.SYSTEM]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.TESTS]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.SW]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.PWA]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.AUTH]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.API]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.ROUTER]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.VUEX]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.VUEX_CACHE]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.VUEX_CORE]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.VUEX_DBG]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB]: LogLevelEnum.TRACE,
      [LogSystemModulesEnum.RXDB_REACTIVE]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_WS]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_CACHE]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_OBJ]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_GQL]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_LST]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.RXDB_EVENT]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.MUTEX]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.BOOT]: LogLevelEnum.WARNING,
      [LogSystemModulesEnum.CP]: LogLevelEnum.WARNING,
   },
   colors: {
      hello: 'goodbye'
   },
   count: 0,
   wsReady: false // мастерской можно пользоваться (она загрузилась и свободна)
}
