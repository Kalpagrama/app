import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX)
