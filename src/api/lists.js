import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import assert from 'assert'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import { apiCall } from 'src/api/index'
import { EventApi } from 'src/api/event'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

const FindCollectionEnum = Object.freeze({
   WS: 'WS',
   OBJECTS: 'OBJECTS',
   EVENTS: 'EVENTS'
})

class ListsApi {
   // sphereItems query
   static checkMangoQuery (mangoQuery) {
      const f = ListsApi.checkMangoQuery
      logD(f, 'start', mangoQuery)
      const t1 = performance.now()
      let ex = {
         selector: {
            rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
            oidSphere: 'AGKAwKuAwCU=',
            objectTypeEnum: { $in: ['WORD', 'SENTENCE'] },
            oidAuthor: 'AF6H7dLAoAI=',
            pageToken: null,
            sortStrategy: 'HOT'
         },
         limit: 8888
      }
      assert(mangoQuery, '!mangoQuery')
      assert(mangoQuery.selector, '!mangoQuery.selector')
      assert(mangoQuery.selector.oidSphere || mangoQuery.selector.rxCollectionEnum === RxCollectionEnum.LST_SEARCH, '!mangoQuery.selector.oidSphere')
      delete mangoQuery.selector.rxCollectionEnum
      for (let key in mangoQuery) {
         assert(['selector', 'limit', 'pageToken'].includes(key), '[selector, sort, limit].includes(key)')
      }
      for (let key in mangoQuery.selector) {
         // assert(['objectTypeEnum', 'oidSphere', 'oidAuthor', 'pageToken', 'sortStrategy', 'name', 'jointItemType'].includes(key), '[objectTypeEnum, oidSphere, oidAuthor].includes(key)')
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   }

   static async getList (mangoQuery) {
      const f = ListsApi.getList
      logD(f, 'start')
      const t1 = performance.now()
      assert(mangoQuery && mangoQuery.selector && mangoQuery.selector.rxCollectionEnum, 'bad query 4' + JSON.stringify(mangoQuery))
      let rxCollectionEnum = mangoQuery.selector.rxCollectionEnum
      assert(rxCollectionEnum in RxCollectionEnum, 'bad rxCollectionEnum:' + rxCollectionEnum)
      let res
      let pagination = { pageSize: 1000, pageToken: null }
      switch (rxCollectionEnum) {
         case RxCollectionEnum.LST_FEED:
            res = await ListsApi.find(FindCollectionEnum.EVENTS, mangoQuery)
            for (let event of res.items) {
               event.card = EventApi.makeEventCard(event)
            }
            // res.items = res.items.filter(ev => !ev.type.in('WS_ITEM_CREATED', 'WS_ITEM_UPDATED', 'WS_ITEM_DELETED', 'PROGRESS'))
            break
         case RxCollectionEnum.LST_SPHERE_NODES:
            assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
            mangoQuery.selector.objectTypeEnum = { $in: ['NODE'] }
            // res = await ListsApi.sphereNodes(mangoQuery.selector.oidSphere, pagination)
            res = await ListsApi.find(FindCollectionEnum.OBJECTS, mangoQuery)
            break
         case RxCollectionEnum.LST_SPHERE_JOINTS:
            assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
            mangoQuery.selector.objectTypeEnum = { $in: ['JOINT'] }
            // res = await ListsApi.sphereNodes(mangoQuery.selector.oidSphere, pagination)
            res = await ListsApi.find(FindCollectionEnum.OBJECTS, mangoQuery)
            break
         case RxCollectionEnum.LST_SPHERE_ITEMS:
            assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
            if (!mangoQuery.selector.objectTypeEnum) mangoQuery.selector.objectTypeEnum = { $in: ['JOINT', 'NODE'] }
            // res = await ListsApi.sphereNodes(mangoQuery.selector.oidSphere, pagination)
            res = await ListsApi.find(FindCollectionEnum.OBJECTS, mangoQuery)
            break
         case RxCollectionEnum.LST_SUBSCRIBERS:
            assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
            res = await ListsApi.objSubscribers(mangoQuery.selector.oidSphere, pagination)
            break
         case RxCollectionEnum.LST_SUBSCRIPTIONS:
            assert(mangoQuery.selector.oidSphere, '!mangoQuery.selector.oidSphere')
            res = await ListsApi.userSubscriptions(mangoQuery.selector.oidSphere, pagination)
            break
         case RxCollectionEnum.LST_SEARCH:
            res = await ListsApi.find(FindCollectionEnum.OBJECTS, mangoQuery, true)
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
      //     assert(node.metaStatic && node.metaStatic.items && node.metaStatic.items.length > 0, 'node.metaStatic && node.metaStatic.items && node.metaStatic.items.length > 0')
      //     // ищем первый layer на этот контент
      //     for (let c of node.metaStatic.items) {
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

   static async find (collection, mangoQuery, search = false) {
      ListsApi.checkMangoQuery(mangoQuery)
      const f = ListsApi.find
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { find: { items, events, objects, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
            query: gql`
                ${search ? fragments.findResultFragmentForSearch : fragments.findResultFragment}
                query find ($collection: FindCollectionEnum! $mangoQuery: RawJSON!){
                    find (collection: $collection, mangoQuery: $mangoQuery) {
                        ...findResultFragment
                    }
                }
            `,
            variables: { collection, mangoQuery }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         assert(count >= 0, 'count >= 0')
         return { items: items || events || objects, count, totalCount, nextPageToken }
      }
      return await apiCall(f, cb)
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

   // внимание ! вернет НЕ реактивный элемент!!!
   static async objSubscribers (oid, pagination) {
      const f = ListsApi.objSubscribers
      logD(f, 'start')
      let obj = await rxdb.get(RxCollectionEnum.OBJ, oid, { clientFirst: false }) // clientFirst: false - из-за того, что при создании ядра - в кэш помещается dummyNode
      assert(obj, '!obj')
      let subscribers = obj.subscribers || [] // внимание ! не реактивно!!!!
      assert(Array.isArray(subscribers), '!Array.isArray(obj.subscribers)')
      return {
         items: subscribers,
         count: subscribers.length,
         totalCount: subscribers.length,
         nextPageToken: null
      }
   }
}

export { ListsApi }
