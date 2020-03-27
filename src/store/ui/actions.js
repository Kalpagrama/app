import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)

export const action = async (context, [options, cb]) => {
  logD('@action start', options)
  context.commit('stateSet', ['actionOptions', options])
  context.commit('stateSet', ['actionOpened', true])
  let intervalTimeTotal = 0
  let intervalTimeTotalMax = options.timeout || 2000
  let intervalTime = 100
  let intervalHandler = () => {
    // logD('@action waiting...', intervalTimeTotal + '/' + intervalTimeTotalMax)
    intervalTimeTotal += intervalTime
    if (context.state.actionOpened === false || intervalTimeTotal >= intervalTimeTotalMax) {
      clearInterval(interval)
      cb(context.state.actionKey, options.payload)
      context.commit('stateSet', ['actionOpened', false])
      context.commit('stateSet', ['actionOptions', null])
      context.commit('stateSet', ['actionKey', undefined])
      logD('@action done')
    }
  }
  let interval = setInterval(intervalHandler, intervalTime)
}
