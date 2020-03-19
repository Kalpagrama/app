import { apollo } from 'src/boot/apollo'
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
export const setWebPushToken = async (context, token) => {
  logD('core/setWebPushToken action start')
  if (context.state.initialized) return
  if (token) {
    if (context.state.webPushToken === token) return // это значение было отправлено ранее и сервер уже знает его
    let { data: { objectChange } } = await apollo.clients.auth.mutate({
      mutation: gql`
        mutation setWebPushToken ($token: String!) {
          setWebPushToken (token: $token)
        }
      `,
      variables: {
        token: token
      }
    })
    context.commit('stateSet', ['webPushToken', token])
  }
  logD('core/setWebPushToken action complete')
  return true
}
