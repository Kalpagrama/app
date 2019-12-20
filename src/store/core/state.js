import {LogLevelEnum, LogModulesEnum} from 'src/boot/log'
export default {
  initialized: false,
  name: 'Kalpagramma',
  version: '0.0.32',
  online: true, // если сеть недоступна - присваивается false
  webPushToken: null,
  webPushTokenDraft: null,
  newVersionAvailable: false,
  installPrompt: null, // ф-я вызова диалога "установить приложение"
  logLevel: LogLevelEnum.DEBUG,
  logLevelSentry: LogLevelEnum.CRITICAL,
  logModulesBlackList: [LogModulesEnum.BOOT],
  colors: {
    hello: 'goodbye'
  }
}
