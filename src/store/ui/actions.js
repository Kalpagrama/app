import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)

export const action = async (context, [options, cb]) => {
  logD('@action start')
  context.commit('stateSet', ['actionOptions', options])
  context.commit('stateSet', ['actionOpened', true])
  let intervalTimeTotal = 0
  let intervalTimeTotalMax = options.timeout || 1000
  let intervalTime = 100
  let intervalHandler = () => {
    logD('@action waiting...', intervalTimeTotal + '/' + intervalTimeTotalMax)
    intervalTimeTotal += intervalTime
    if (context.state.actionOpened === false || intervalTimeTotal >= intervalTimeTotalMax) {
      cb(context.state.actionKey, options.payload)
      context.commit('stateSet', ['actionOpened', false])
      context.commit('stateSet', ['actionOptions', null])
      context.commit('stateSet', ['actionKey', undefined])
      clearInterval(interval)
      logD('@action done')
    }
  }
  let interval = setInterval(intervalHandler, intervalTime)
}
