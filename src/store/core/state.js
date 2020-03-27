import {LogLevelEnum, LogModulesEnum} from 'src/boot/log'
export default {
  initialized: false,
  name: 'Kalpagramma',
  version: '2.0.0',
  online: true, // если сеть недоступна - присваивается false
  shareData: null, // данные от меню "поделиться в приложение"
  webPushTokenDraft: null,
  newVersionAvailable: false,
  installPrompt: null, // ф-я вызова диалога "установить приложение"
  logLevel: LogLevelEnum.DEBUG,
  logLevelSentry: LogLevelEnum.CRITICAL,
  logModulesBlackList: [LogModulesEnum.ML], // LogModulesEnum.VUEX, LogModulesEnum.VUEX_WS
  colors: {
    hello: 'goodbye'
  }
}
