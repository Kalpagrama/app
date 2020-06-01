import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class ListsApi {
  static async getList (mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    let res
    let pagination = { pageSize: 1000, pageToken: null }
    switch (rxCollectionEnum) {
      case RxCollectionEnum.LST_FEED:
        res = await ListsApi.feed(pagination)
        break
      case RxCollectionEnum.LST_SPHERE_SPHERES:
        assert(mangoQuery.selector.oid, '!mangoQuery.selector.oid')
        res = await ListsApi.sphereSpheres(mangoQuery.selector.oid, pagination)
        break
      case RxCollectionEnum.LST_SPHERE_NODES:
      case RxCollectionEnum.LST_NODE_NODES:
        assert(mangoQuery.selector.oid, '!mangoQuery.selector.oid')
        res = await ListsApi.sphereNodes(mangoQuery.selector.oid, pagination)
        break
      case RxCollectionEnum.LST_USER_SUBSCRIBERS:
        assert(mangoQuery.selector.oid, '!mangoQuery.selector.oid')
        res = await ListsApi.userSubscribers(mangoQuery.selector.oid, pagination)
        break
      case RxCollectionEnum.LST_USER_SUBSCRIPTIONS:
        assert(mangoQuery.selector.oid, '!mangoQuery.selector.oid')
        res = await ListsApi.userSubscriptions(mangoQuery.selector.oid, pagination)
        break
      default:
        throw new Error('bad rxCollectionEnum: ' + rxCollectionEnum)
    }
    // if (rxCollectionEnum === RxCollectionEnum.LST_CONTENT_NODES) {
    //   // вернет ядра контента относительно метки времени (nodeList).
    //   // nodeList может изменится в после одного из последующих вызовов getIdx
    //   // getIdx - вернет индекс ядра в nodeList
    //   // getT - вернет время на контенте на основе индекса ядра
    //   // contentNodes - вызывается один раз (при инициализации окна контента)
    //   // getIdx - может вызываться не более чем раз в секунду (иногда этот вызов приведет к тому, что данные дозапросятся и дополнят nodeList)
    //
    //   // вернет расстояние от t до начала ядра. началом ядра считается начало первого по списку слоя с этим(contentOid) контентом
    //   const getDistance = (contentOid, t, node) => {
    //     assert(contentOid && node, 'contentOid && node')
    //     assert(node.meta && node.meta.items && node.meta.items.length > 0, 'node.meta && node.meta.items && node.meta.items.length > 0')
    //     // ищем первый layer на этот контент
    //     for (let c of node.meta.items) {
    //       assert(c.layers, 'c.layers')
    //       for (let l of c.layers) {
    //         assert(l.figuresAbsolute, 'l.figuresAbsolute')
    //         assert(l.contentOid)
    //         if (l.contentOid === contentOid) {
    //           assert(l.figuresAbsolute.length, 'l.figuresAbsolute.length')
    //           let nodeStart = l.figuresAbsolute[0].t
    //           return Math.abs(nodeStart - t)
    //         }
    //       }
    //     }
    //     return Infinity
    //   }
    //   let nodeList = res.items
    //   let contentOid = mangoQuery.selector.oid
    //   res.getIdx = (t) => {
    //     // todo запрашивать новые порции данных
    //     for (let i = 0; i < nodeList.length; i++) {
    //       let distance, nextDistance
    //       distance = getDistance(contentOid, t, nodeList[i])
    //       if (i + 1 < nodeList.length) nextDistance = getDistance(contentOid, t, nodeList[i + 1])
    //       if (!nextDistance || nextDistance > distance) return i
    //     }
    //     // let tRounded = Math.round(t / 60) * 60 // округляем до ближайшей минуты (для того чтобы ключ для sphereItems не получался каждый раз - разным)
    //     return -1
    //   }
    //   res.getT = (indx) => {
    //     // todo запрашивать новые порции данных
    //     assert(indx >= 0 && indx < nodeList.length, 'indx && indx < nodeList.length')
    //     return getDistance(contentOid, 0, nodeList[indx])
    //   }
    // }
    return res
  }

  static async sphereSpheres (oid, pagination, filter, sortStrategy) {
    let f = this.sphereSpheres
    logD(f, 'start')
    let { data: { sphereSpheres: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        query sphereSpheres ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum){
          sphereSpheres (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            items {
              oid
              name
            }
          }
        }
      `,
      variables: { oid, pagination, filter, sortStrategy }
    })
    logD(f, 'complete')
    return { items, count, totalCount, nextPageToken }
  }

  static async sphereNodes (oid, pagination, filter, sortStrategy) {
    let f = this.sphereNodes
    logD(f, 'start')
    let { data: { sphereItems: { items, count, totalCount, nextPageToken, prevPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query sphereNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereItems (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: { oid, pagination, filter, sortStrategy }
    })
    logD(f, 'complete')
    return { items, count, totalCount, nextPageToken, prevPageToken }
  }

  static async feed (pagination) {
    let f = this.feed
    logD(f, 'start')
    let { data: { feed: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query feed ($pagination: PaginationInput!) {
          feed (pagination: $pagination) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: { pagination }
    })
    logD(f, 'complete')
    return { items, count, totalCount, nextPageToken }
  }

  static async events (pagination) {
    let { data: { events: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.eventFragment}
        query events ( $pagination: PaginationInput!){
          events (pagination: $pagination) {
            totalCount
            count
            nextPageToken
            items {...eventFragment}
          }
        }
      `,
      variables: { pagination }
    })
    return { items, count, totalCount, nextPageToken }
  }

  static async userSubscriptions (oid, pagination) {
    let user = await rxdb.get(RxCollectionEnum.OBJ, oid)
    assert(user && user.subscriptions, '!user')
    assert(Array.isArray(user.subscriptions), '!Array.isArray(user.subscriptions)')
    return {
      items: user.subscriptions,
      count: user.subscriptions.length,
      totalCount: user.subscriptions.length,
      nextPageToken: null
    }
  }

  static async userSubscribers (oid, pagination) {
    let user = await rxdb.get(RxCollectionEnum.OBJ, oid)
    assert(user && user.subscribers, '!user')
    assert(Array.isArray(user.subscribers), '!Array.isArray(user.subscribers)')
    return {
      items: user.subscribers,
      count: user.subscribers.length,
      totalCount: user.subscribers.length,
      nextPageToken: null
    }
  }
}

export { ListsApi }