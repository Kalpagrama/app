import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX_DBG)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX_DBG)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.VUEX_DBG)
