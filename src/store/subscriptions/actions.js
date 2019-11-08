import { apolloProvider } from 'boot/apollo'
import {
  eventFragment,
  WSContentFragment,
  WSFragmentFragment,
  WSDraftFragment,
  WSBookmarkFragment,
  WSTagFragment
} from 'schema/index'

export const init = async (state, userSubscriptions) => {
  if (state.getters.initialized) throw new Error('subscriptions state initialized already')
  state.dispatch('log/debug', ['subscriptions', 'init', userSubscriptions], { root: true })
  state.commit('init', userSubscriptions)
  return userSubscriptions
}

export const subscribe = async (state, oid) => {
  state.dispatch('log/debug', ['subscriptions', 'subscribe', oid], { root: true })
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
  state.commit('subscribe', oid)
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
