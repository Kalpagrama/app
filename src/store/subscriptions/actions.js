import { apolloProvider } from 'boot/apollo'
import { logD } from 'src/boot/log'

export const init = async (context) => {
  // if (context.state.initialized) throw new Error('subscriptions state initialized already')
  if (context.state.initialized) return
  logD('subscriptions', 'init', context.rootState.objects.currentUser.subscriptions)
  context.commit('init', context.rootState.objects.currentUser.subscriptions)
  return true
}

// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  logD('subscriptions', 'subscribe', oid)
  let { data: { subscribe } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation subscribe ($oid: OID!) {
        subscribe (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  return subscribe
}
// Отписаться от сущности. Мутация будет вызвана по приходу эвента
export const unSubscribe = async (state, oid) => {
  logD('subscriptions', 'subscribe', oid)
  let { data: { unSubscribe } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation unSubscribe ($oid: OID!) {
        unSubscribe (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  return unSubscribe
}
