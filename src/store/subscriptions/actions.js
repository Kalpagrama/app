import { apolloProvider } from 'boot/apollo'

export const init = async (context, userSubscriptions) => {
  if (context.getters.initialized) throw new Error('subscriptions state initialized already')
  context.dispatch('log/debug', ['subscriptions', 'init', userSubscriptions], { root: true })
  context.commit('init', userSubscriptions)
  return userSubscriptions
}

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
  context.commit('subscribe', oid)
  return subscribe
}

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
  state.commit('unSubscribe', oid)
  return unSubscribe
}
