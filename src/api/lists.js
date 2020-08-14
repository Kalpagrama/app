import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import assert from 'assert'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class ListsApi {
  // sphereItems query
  static checkMangoQuery(mangoQuery){
    const f = this.checkMangoQuery
    logD(f, 'start', mangoQuery)
    let ex = {
      selector: {
        oidSphere: 'AGKAwKuAwCU=',
        objectTypeEnum: 'NODE',
        oidAuthor: 'AF6H7dLAoAI=',
        pageToken: null,
        sortStrategy: 'HOT'
      },
      limit: 8888
    }
    assert(mangoQuery, '!mangoQuery')
    assert(mangoQuery.selector, '!mangoQuery.selector')
    assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
    delete mangoQuery.selector.rxCollectionEnum
    for (let key in mangoQuery){
      assert(['selector', 'limit'].includes(key), '[selector, sort, limit].includes(key)')
    }
    for (let key in mangoQuery.selector){
      assert(['objectTypeEnum', 'oidSphere', 'oidAuthor', 'pageToken', 'sortStrategy'].includes(key), '[objectTypeEnum, oidSphere, oidAuthor].includes(key)')
    }
  }

  static async getList (mangoQuery) {
    assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 4' + JSON.stringify(mangoQuery))
    let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
    assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
    let res
    let pagination = { pageSize: 1000, pageToken: null }
    switch (rxCollectionEnum) {
      case RxCollectionEnum.LST_FEED:
        res = await ListsApi.feed(pagination)
        break
      case RxCollectionEnum.LST_SPHERE_SPHERES:
        assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
        // res = await ListsApi.sphereSpheres(mangoQuery.selector.oidSphere, pagination)
        res = await ListsApi.find(mangoQuery)
        break
      case RxCollectionEnum.LST_SPHERE_NODES:
        assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
        // res = await ListsApi.sphereNodes(mangoQuery.selector.oidSphere, pagination)
        res = await ListsApi.find(mangoQuery)
        break
      case RxCollectionEnum.LST_SPHERE_CHAINS:
        assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
        // res = await ListsApi.sphereNodes(mangoQuery.selector.oidSphere, pagination)
        res = await ListsApi.find(mangoQuery)
        break
      case RxCollectionEnum.LST_SUBSCRIBERS:
        assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
        res = await ListsApi.objSubscribers(mangoQuery.selector.oidSphere, pagination)
        break
      case RxCollectionEnum.LST_SUBSCRIPTIONS:
        assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
        res = await ListsApi.userSubscriptions(mangoQuery.selector.oidSphere, pagination)
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
    //   let contentOid = mangoQuery.selector.oidSphere
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

  static async find (mangoQuery) {
    ListsApi.checkMangoQuery(mangoQuery)
    let f = this.find
    logD(f, 'start')
    let { data: { find: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query find ($mangoQuery: RawJSON!){
          find (mangoQuery: $mangoQuery) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: {mangoQuery }
    })
    logD(f, 'complete')
    return { items/* : items.filter(item => item.oid !== 'AKCmbRKCwHc=' && item.oid !== 'AKCl7kYCwHY=') */, count, totalCount, nextPageToken }
  }

  // static async sphereSpheres (oid, pagination, filter, sortStrategy) {
  //   let f = this.sphereSpheres
  //   logD(f, 'start')
  //   let { data: { sphereSpheres: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
  //     query: gql`
  //       query sphereSpheres ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum){
  //         sphereSpheres (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
  //           items {
  //             oid
  //             name
  //           }
  //         }
  //       }
  //     `,
  //     variables: { oid, pagination, filter, sortStrategy }
  //   })
  //   logD(f, 'complete')
  //   return { items, count, totalCount, nextPageToken }
  // }

  // static async sphereNodes (oid, pagination, filter, sortStrategy) {
  //   let f = this.sphereNodes
  //   logD(f, 'start')
  //   let { data: { sphereItems: { items, count, totalCount, nextPageToken, prevPageToken } } } = await apollo.clients.api.query({
  //     query: gql`
  //       ${fragments.objectShortWithMetaFragment}
  //       query sphereNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
  //         sphereItems (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
  //           count
  //           totalCount
  //           nextPageToken
  //           items {... objectShortWithMetaFragment}
  //         }
  //       }
  //     `,
  //     variables: { oid, pagination, filter, sortStrategy }
  //   })
  //   logD(f, 'complete')
  //   return { items, count, totalCount, nextPageToken, prevPageToken }
  // }

  static async feed (pagination) {
    let f = this.feed
    // logD(f, 'start')
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
    // logD(f, 'complete')
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

  static async objSubscribers (oid, pagination) {
    let obj = await rxdb.get(RxCollectionEnum.OBJ, oid)
    assert(obj && obj.subscribers, '!obj')
    assert(Array.isArray(obj.subscribers), '!Array.isArray(obj.subscribers)')
    return {
      items: obj.subscribers,
      count: obj.subscribers.length,
      totalCount: obj.subscribers.length,
      nextPageToken: null
    }
  }
}

export { ListsApi }
