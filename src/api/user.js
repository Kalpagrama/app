import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class UserApi {
  static async setFavouriteCategories (categoryTypes) {
    logD('setFavouriteCategories::start')
    let { data: { setFavouriteCategories } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation setFavouriteCategories ($categories: [CategoryEnum!]!){
          setFavouriteCategories(categories: $categories)
        }
      `,
      variables: {
        categories: categoryTypes
      }
    })
    logD('setFavouriteCategories::complete')
    return setFavouriteCategories
  }

  // Подписаться на сущность. Мутация будет вызвана по приходу эвента
  static async subscribe (oid) {
    logD('subscriptions', 'subscribe', oid)
    let { data: { subscribe } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectShortFragment}
        mutation subscribe ($oid: OID!) {
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
  static async unSubscribe (oid) {
    logD('subscriptions', 'unSubscribe', oid)
    let { data: { unSubscribe } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectShortFragment}
        mutation unSubscribe ($oid: OID!) {
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
}

export {UserApi}
