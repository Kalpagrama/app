import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
import { rxdb, RxCollectionEnum } from 'src/system/rxdb'
import { LstCollectionEnum } from 'src/system/rxdb/common'
import { apiCall } from 'src/api/index'
import {assert} from 'src/system/common/utils'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

const UserRoleEnum = Object.freeze({
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
  UNCONFIRMED: 'UNCONFIRMED', // неподтвержденная запись (нужно будет подтвердить позже)
  GUEST: 'GUEST' // вход без логина
})

class UserApi {
  static async setFavouriteCategories (categoryTypes) {
    const f = UserApi.setFavouriteCategories
    logD(f, 'start')
    const t1 = performance.now()
    const cb = async () => {
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
      for (let rxDoc of rxDocs){
        await rxdb.cache.expire(rxDoc.id)
      }
      logD(f, 'complete')
      return setFavouriteCategories
    }
    return await apiCall(f, cb)
  }

  // Подписаться на сущность. Мутация будет вызвана по приходу эвента
  static async subscribe (oid) {
    const f = UserApi.subscribe
    logD(f, 'start', oid)
    const t1 = performance.now()
    // let objectFull = await rxdb.get(RxCollectionEnum.OBJ, oid) // вне cb - иначе дедлок
    const cb = async () => {
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
    return await apiCall(f, cb)
  }

  static async checkUsernameFree (username) {
    const f = UserApi.checkUsernameFree
    logD(f, 'start', username)
    const t1 = performance.now()
    const cb = async () => {
      let { data: { checkUsernameFree } } = await apollo.clients.auth.query({
        query: gql`
          query  ($username: String!){
            checkUsernameFree(username: $username)
          }
        `,
        variables: {
          username
        }
      })
      return checkUsernameFree
    }
    let res = await apiCall(f, cb)
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, res)
    return res
  }

  static async isSubscribed (oid) {
    const f = UserApi.isSubscribed
    logD(f, 'start', oid)
    const t1 = performance.now()
    let currentUserOid = rxdb.getCurrentUser().oid // localStorage.getItem('k_user_oid')
    // assert(oid === currentUserOid, 'разрешено только для текущего юзера')
    let { items } = await rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
        oidSphere: oid,
        objectTypeEnum: {$in: ['USER']}
      },
      populateObjects: false,
    })
    let res = items.find(item => item.oid === currentUserOid) ? true : false
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`, res)
    return res
  }

  // Отписаться от сущности. Мутация будет вызвана по приходу эвента
  static async unSubscribe (oid) {
    const f = UserApi.subscribe
    logD(f, 'start', oid)
    console.log('unSubscribe', oid)
    const t1 = performance.now()
    const cb = async () => {
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
    return await apiCall(f, cb)
  }
}

export { UserApi, UserRoleEnum }
