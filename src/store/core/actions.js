import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX)
