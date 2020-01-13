import assert from 'assert'

import { apollo } from 'src/boot/apollo'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { fragments } from 'src/schema'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX)
// todo переместить текущего пользователя в objects
export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
  return true
}

export const setFavouriteCategories = async (context, categoryTypes) => {
  logD('setFavouriteCategories start')
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
  logD('setFavouriteCategories complete')
  return setFavouriteCategories
}

// Подписаться на сущность. Мутация будет вызвана по приходу эвента
export const subscribe = async (context, oid) => {
  logD('subscriptions', 'subscribe', oid)
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
  logD('subscriptions', 'subscribe OK', oid)
  return subscribe
}
// Отписаться от сущности. Мутация будет вызвана по приходу эвента
export const unSubscribe = async (context, oid) => {
  logD('subscriptions', 'unSubscribe', oid)
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
  logD('subscriptions', 'unSubscribe OK', oid)
  return unSubscribe
}
