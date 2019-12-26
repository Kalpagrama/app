import {LogLevelEnum, LogModulesEnum} from 'src/boot/log'
export default {
  initialized: false,
  name: 'Kalpagramma',
  version: '0.0.36',
  online: true, // если сеть недоступна - присваивается false
  shareData: null, // данные от меню "поделиться в приложение"
  webPushToken: null,
  webPushTokenDraft: null,
  newVersionAvailable: false,
  installPrompt: null, // ф-я вызова диалога "установить приложение"
  logLevel: LogLevelEnum.DEBUG,
  logLevelSentry: LogLevelEnum.CRITICAL,
  logModulesBlackList: [],
  colors: {
    hello: 'goodbye'
  }
}
