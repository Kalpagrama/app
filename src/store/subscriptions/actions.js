import { apolloProvider } from 'boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)

export const init = async (context) => {
  if (context.state.initialized) return
  logD('subscriptions', 'init', context.rootState.objects.currentUser.subscriptions, this)
  context.commit('init', context.rootState.objects.currentUser.subscriptions)
  return true
}

// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  logD('subscriptions', 'subscribe', oid)
  let { data: { subscribe } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation sw_network_only_subscribe ($oid: OID!) {
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
      mutation sw_network_only_unSubscribe ($oid: OID!) {
        unSubscribe (oid: $oid)
      }
    `,
    variables: {
      oid
    }
  })
  return unSubscribe
}
