import { apolloProvider } from 'boot/apollo'

export const init = async (context) => {
  if (context.state.initialized) return
  let token = context.state.webPushTokenDraft
  if (token) {
    if (context.state.webPushToken === token) return // это значение было отправлено ранее и сервер уже знает его
    let { data: { objectChange } } = await apolloProvider.clients.authApollo.mutate({
      mutation: gql`
        mutation sw_cache_setWebPushToken ($token: String!) {
          setWebPushToken (token: $token)
        }
      `,
      variables: {
        token: token
      }
    })
    context.commit('stateSet', ['webPushToken', token])
  }
  context.commit('init')
  return true
}
