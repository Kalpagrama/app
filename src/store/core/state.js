import {LogLevelEnum, LogModulesEnum} from 'src/boot/log'
export default {
  initialized: false,
  name: 'Kalpagrama',
  version: '2.0.0',
  online: true, // если сеть недоступна - присваивается false
  shareData: null, // данные от меню "поделиться в приложение"
  newVersionAvailable: false,
  installPrompt: null, // ф-я вызова диалога "установить приложение"
  logLevel: LogLevelEnum.DEBUG,
  logLevelSentry: LogLevelEnum.CRITICAL,
  logModulesBlackList: [], // LogModulesEnum.ML, LogModulesEnum.VUEX, ...
  colors: {
    hello: 'goodbye'
  },
  progressInfo: {
    UPLOAD: {}, // {oid: progress, oid: progress}
    CREATE: {}, // {oid: progress, oid: progress}
  }
}
