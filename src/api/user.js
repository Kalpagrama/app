import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { rxdb, RxCollectionEnum } from 'src/system/rxdb'
import { LstCollectionEnum } from 'src/system/rxdb/lists'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

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
    let rxDocs = await rxdb.cache.find({
      selector: {
        'props.rxCollectionEnum': LstCollectionEnum.LST_FEED,
      }
    })
    logD('setFavouriteCategories::lists =', rxDocs)
    for (let rxDoc of rxDocs){
      await rxdb.cache.expire(rxDoc.id)
    }
    logD('setFavouriteCategories::complete')
    return setFavouriteCategories
  }

  // Подписаться на сущность. Мутация будет вызвана по приходу эвента
  static async subscribe (oid) {
    const f = UserApi.subscribe
    logD(f, 'start', oid)
    const t1 = performance.now()
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
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, subscribe)
    return subscribe
  }

  // check subscription
  static async isSubscribed (oid) {
    const f = UserApi.isSubscribed
    logD(f, 'start', oid)
    const t1 = performance.now()
    let objectFull = await rxdb.get(RxCollectionEnum.OBJ, oid)
    let { items } = await rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
        oidSphere: oid
      }
    })
    let currentUserOid = localStorage.getItem('k_user_oid')
    let res = items.find(item => item.oid === currentUserOid) ? true : false
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, res)
    return res
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

export { UserApi }
