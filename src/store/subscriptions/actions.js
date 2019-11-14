import { apolloProvider } from 'boot/apollo'

export const init = async (context, userSubscriptions) => {
  // if (context.getters.initialized) throw new Error('subscriptions state initialized already')
  if (context.getters.initialized) return
  context.dispatch('log/debug', ['subscriptions', 'init', userSubscriptions], { root: true })
  context.commit('init', userSubscriptions)
  return userSubscriptions
}

// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  context.dispatch('log/debug', ['subscriptions', 'subscribe', oid], { root: true })
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
  state.dispatch('log/debug', ['subscriptions', 'subscribe', oid], { root: true })
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
