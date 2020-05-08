import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
  if (context.state.webPushTokenDraft){
    await setWebPushToken(context, context.state.webPushTokenDraft)
  }
  return true
}

// сообщит токен на сервер (при условии что тот еще не был сообщен)
export const setWebPushToken = async (context, token) => {
  logD('core/setWebPushToken action start', token)
  assert(token)
  if (!context.state.initialized){
    context.commit('core/stateSet', ['webPushTokenDraft', token], {root: true})
    logD('core/setWebPushToken wait for initialize')
    return
  }
  // проводим эту мутацию через кэш(чтобы не дергать сервер каждый раз с одим и тем же токеном)
  const fetchItemFunc = async () => {
    let { data: { objectChange } } = await apollo.clients.auth.query({
      query: gql`
        query ($token: String!) {
          setWebPushToken (token: $token)
        }
      `,
      variables: {
        token: token
      }
    })
    return {
      item: true,
      actualAge: 'day'
    }
  }
  let result = await context.dispatch('cache/get', { key: `setWebPushToken:${token}`, fetchItemFunc }, { root: true })
  logD('core/setWebPushToken action complete')
  return result
}
