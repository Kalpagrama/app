import { apollo } from 'src/boot/apollo'

export const init = async (context) => {
  if (context.state.initialized) return
  let token = context.state.webPushTokenDraft
  await setWebPushToken(context, token)
  context.commit('init')
  return true
}
export const setWebPushToken = async (context, token) => {
  if (context.state.initialized) return
  if (token) {
    if (context.state.webPushToken === token) return // это значение было отправлено ранее и сервер уже знает его
    let { data: { objectChange } } = await apollo.clients.auth.mutate({
      mutation: gql`
        mutation sw_network_first_setWebPushToken ($token: String!) {
          setWebPushToken (token: $token)
        }
      `,
      variables: {
        token: token
      }
    })
    context.commit('stateSet', ['webPushToken', token])
  }
  return true
}
