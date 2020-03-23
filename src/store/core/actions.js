import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  let token = context.state.webPushTokenDraft
  await setWebPushToken(context, token)
  context.commit('init')
  return true
}

// сообщит токен на сервер (при условии что тот еще не был сообщен)
export const setWebPushToken = async (context, token) => {
  logD('core/setWebPushToken action start')
  assert(token)
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
  let result = await context.dispatch('cache/get', { key: `setWebPushToken: ${token}`, fetchItemFunc }, { root: true })
  logD('core/setWebPushToken action complete')
  return result
}
