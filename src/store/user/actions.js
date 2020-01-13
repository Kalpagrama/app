import assert from 'assert'

import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { fragments } from 'src/schema'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
// todo переместить текущего пользователя в objects
export const init = async (context, oid) => {
  if (context.state.initialized) return
  context.commit('init', oid)
  return true
}

export const setFavouriteCategories = async (context, categoryTypes) => {
  // logD('', categoryTypes)
  let { data: { setFavouriteCategories } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_setFavouriteCategories ($categories: [CategoryEnum!]!){
        setFavouriteCategories(categories: $categories)
      }
    `,
    variables: {
      categories: categoryTypes
    }
  })
  return setFavouriteCategories
}

// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  logD('subscriptions', 'subscribe', oid, context.rootGetters['objects/get'](context.state.oid))
  let { data: { subscribe } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectShortFragment}
      mutation sw_network_only_subscribe ($oid: OID!) {
        subscribe (oid: $oid){
          ...objectShortFragment
        }
      }
    `,
    variables: {
      oid
    }
  })
  logD('subscriptions', 'subscribe OK', oid, context.rootGetters['objects/get'](context.state.oid))
  return subscribe
}
// Отписаться от сущности. Мутация будет вызвана по приходу эвента
export const unSubscribe = async (context, oid) => {
  logD('subscriptions', 'unSubscribe', oid, context.rootGetters['objects/get'](context.state.oid))
  let { data: { unSubscribe } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectShortFragment}
      mutation sw_network_only_unSubscribe ($oid: OID!) {
        unSubscribe (oid: $oid){
          ...objectShortFragment
        }
      }
    `,
    variables: {
      oid
    }
  })
  logD('subscriptions', 'unSubscribe OK', oid, context.rootGetters['objects/get'](context.state.oid))
  return unSubscribe
}
