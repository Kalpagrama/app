import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { mdiGestureSwipeRight } from '@quasar/extras/mdi-v4'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
}

export const sphereSpheres = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereSpheres start')
  assert.ok(oid)
  const fetchItemFunc = async () => {
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
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let listResult = await context.dispatch('cache/get',
    {
      key: 'list: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }),
      fetchItemFunc
    }, { root: true })
  logD('sphereSpheres complete')
  return listResult
}

export const events = async (context, { pagination }) => {
  logD('events start')
  assert.ok(pagination)
  const fetchItemFunc = async () => {
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
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let eventFeedResult = await context.dispatch('cache/get',
    {
      key: 'feedEvent: ' + JSON.stringify({ pagination }),
      fetchItemFunc
    }, { root: true })
  logD('events complete')
  return eventFeedResult
}

export const sphereNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereNodes start')
  const fetchItemFunc = async () => {
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
    return {
      item: { items, count, totalCount, nextPageToken, prevPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let { items, count, totalCount, nextPageToken, prevPageToken } = await context.dispatch('cache/get',
    { key: 'list: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }), fetchItemFunc }, { root: true })
  logD('sphereNodes complete')
  const setCurrentIndx = (indx) => {
    // todo запрашивать новые порции данных
  }
  return { items, count, totalCount, nextPageToken, prevPageToken, setCurrentIndx }
}

// export const compositionNodes = async (context, { compositionOids, pagination, sortStrategy }) => {
//   logD('compositionNodes start')
//   let filter = { types: ['NODE'] }
//   let oid
//   oid = compositionOids[0]
//   filter.compositionOids = compositionOids
//   const fetchItemFunc = async () => {
//     let { data: { sphereItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
//       query: gql`
//         ${fragments.objectShortWithMetaFragment}
//         query nodeNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
//           sphereItems (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
//             count
//             totalCount
//             nextPageToken
//             items {... objectShortWithMetaFragment}
//           }
//         }
//       `,
//       variables: { oid, pagination, filter, sortStrategy }
//     })
//     return {
//       item: { items, count, totalCount, nextPageToken },
//       actualAge: 'hour'
//     }
//   }
//   // { items, count, totalCount, nextPageToken }
//   let feedResult = await context.dispatch('cache/get',
//     {
//       key: 'list: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }),
//       fetchItemFunc
//     }, { root: true })
//   logD('compositionNodes complete')
//   return feedResult
// }

// вернет ядра контента относительно метки времени (nodeList).
// nodeList может изменится в после одного из последующих вызовов getIdx
// getIdx - вернет индекс ядра в nodeList
// getT - вернет время на контенте на основе индекса ядра
// contentNodes - вызывается один раз (при инициализации окна контента)
// getIdx - может вызываться не более чем раз в секунду (иногда этот вызов приведет к тому, что данные дозапросятся и дополнят nodeList)
export const contentNodes = async (context, { contentOid }) => {
  logD('contentNodes start')
  const fetchItemFunc = async () => {
    // TODO делать запрос с пагинацией по 30 (а потом дозапрашивать при вызове getT)
    let { items, count, totalCount, nextPageToken, prevPageToken, setCurrentIndx} = await sphereNodes(context, {
      oid: contentOid,
      pagination: { pageSize: 1000, pageToken: null },
      filter: null,
      sortStrategy: 'RELATING_TO_TIME'
    })
    return {
      item: { nodeList: items, count, totalCount, nextPageToken, prevPageToken },
      actualAge: 'hour'
    }
  }
  let { nodeList, nextPageToken, prevPageToken } = await context.dispatch('cache/get', {
    key: 'contentNodes: ' + contentOid,
    fetchItemFunc
  }, { root: true })

  // вернет расстояние от t до начала ядра. началом ядра считается начало первого по списку слоя с этим(contentOid) контентом
  const getDistance = (contentOid, t, node) => {
    assert(contentOid && node, 'contentOid && node')
    assert(node.meta && node.meta.items && node.meta.items.length > 0, 'node.meta && node.meta.items && node.meta.items.length > 0')
    // ищем первый layer на этот контент
    for (let c of node.meta.items) {
      assert(c.layers, 'c.layers')
      for (let l of c.layers) {
        assert(l.figuresAbsolute, 'l.figuresAbsolute')
        assert(l.contentOid)
        if (l.contentOid === contentOid) {
          assert(l.figuresAbsolute.length, 'l.figuresAbsolute.length')
          let nodeStart = l.figuresAbsolute[0].t
          return Math.abs(nodeStart - t)
        }
      }
    }
    return Infinity
  }

  // вернет индекс ближайшего ядра к t
  // TODO запрашивать fetchItemFunc не более 30 ядер. Остальные дозапрашивать по мере роста t
  const getIdx = (t) => {
    // todo запрашивать новые порции данных
    for (let i = 0; i < nodeList.length; i++) {
      let distance, nextDistance
      distance = getDistance(contentOid, t, nodeList[i])
      if (i + 1 < nodeList.length) nextDistance = getDistance(contentOid, t, nodeList[i + 1])
      if (!nextDistance || nextDistance > distance) return i
    }
    // let tRounded = Math.round(t / 60) * 60 // округляем до ближайшей минуты (для того чтобы ключ для sphereItems не получался каждый раз - разным)
    return -1
  }
  const getT = (indx) => {
    // todo запрашивать новые порции данных
    assert(indx >= 0 && indx < nodeList.length, 'indx && indx < nodeList.length')
    return getDistance(contentOid, 0, nodeList[indx])
  }
  logD('contentNodes complete')
  return { nodeList, getIdx, getT }
}

export const nodeChains = async (context, { nodeOid }) => {
  logD('nodeChains start')
  const fetchItemFunc = async () => {
    let { data: { sphereItems: { items, count, totalCount, nextPageToken, prevPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query nodeChains ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereItems (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            count
            totalCount
            nextPageToken
            items {... objectShortWithMetaFragment}
          }
        }
      `,
      variables: {
        oid: nodeOid,
        pagination: { pageSize: 500, pageToken: null },
        filter: null,
        sortStrategy: 'HOT'
      }
    })
    return {
      item: { chainList: items, count, totalCount, nextPageToken, prevPageToken },
      actualAge: 'hour'
    }
  }
  let { chainList, nextPageToken, prevPageToken } = await context.dispatch('cache/get',
    { key: 'list: ' + JSON.stringify({ oid: nodeOid }), fetchItemFunc }, { root: true })
  const setCurrentIndx = (indx) => {
    // todo запрашивать новые порции данных
  }
  logD('nodeChains complete')
  return { chainList, setCurrentIndx }
}

export const feed = async (context, { pagination }) => {
  logD('feed start')
  assert.ok(pagination)
  const fetchItemFunc = async () => {
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
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  // { items, count, totalCount, nextPageToken }
  let feedResult = await context.dispatch('cache/get',
    { key: 'feed: ' + JSON.stringify({ pagination }), fetchItemFunc }, { root: true })
  logD('feed complete')
  return feedResult
}

// подходит ли object под этот фильтр
function isRestricted (context, filter, objectShort) {
  // logD('isRestricted', filter, objectShort)
  assert(objectShort && objectShort.oid && objectShort.type && objectShort.name, '!objectShort')
  if (!filter) return true
  if (filter.types && !filter.types.includes(objectShort.type)) return false
  if (filter.oids && !filter.oids.includes(objectShort.oid)) return false
  if (filter.name && filter.name !== objectShort.name) return false
  if (filter.nameRegExp && objectShort.name.search(new RegExp(filter.nameRegExp)) === -1) return false
  if (filter.compositionOids) {
    for (let compositionOid of filter.compositionOids) {
      if (!objectShort.meta.items.map(composition => composition.oid).includes(compositionOid)) return false
    }
  }
  return true
}

export const processEvent = async (context, event) => {
  switch (event.type) {
    case 'WS_ITEM_CREATED':
    case 'WS_ITEM_DELETED':
    case 'WS_ITEM_UPDATED':
      return context.dispatch('workspace/updateWsLists', event, { root: true })
    case 'NODE_CREATED':
    case 'CHAIN_CREATED':
    case 'VOTED':
      return await updateLists(context, event)
    default:
      throw new Error(`bad event type ${event.type}`)
  }
}

// прелетел эвент - создано ядро(проголосовано ядро). Добавить ядро во все ленты и на личную сферу
async function updateLists (context, event) {
  logD('addNode start')
  let objectShort = event.object
  assert(objectShort.oid && objectShort.name != null)
  for (let key in context.rootState.cache.cachedItems) {
    let keyPattern = 'list: '
    if (!key.startsWith(keyPattern)) continue
    let { oid, pagination, filter, sortStrategy } = JSON.parse(key.slice(keyPattern.length))
    assert(oid && filter, 'oid && filter')
    if (oid === context.rootState.auth.userOid) {
      assert(event.subject)
      // прилетевшее ядро не создано этим пользователем и не проголосовано этим пользователем
      if (event.subject.oid !== context.rootState.auth.userOid) continue
      // список - это личная сфера этого пользователя
      if (!filter || !filter.fastFilters) continue
      let fastFilter = event.type === 'NODE_CREATED' ? 'CREATED_BY_USER' : 'VOTED_BY_USER'
      if (!filter.fastFilters.includes(fastFilter)) continue
    } else {
      if (event.type !== 'NODE_CREATED' && event.type !== 'CHAIN_CREATED') continue
    }
    if (!isRestricted(context, filter, objectShort)) continue // элемент не подходит под этот фильр

    logD('try add item to list... ', { oid, pagination, filter, sortStrategy })
    await context.dispatch('cache/update', {
      key: key,
      path: '',
      setter: (value) => {
        // { items, count, totalCount, nextPageToken }
        logD('setter: ', value)
        assert(value.items && value.count >= 0 && value.totalCount >= 0)
        // элемент в самом списке - objectShort
        // удалить старый объект (возможно при переголосовании)
        let indx = value.items.findIndex(item => item.oid === objectShort.oid)
        if (indx >= 0) value.items.splice(indx, 1)

        // вставляем в начало используем splice для реактивности
        value.items.splice(0, 0, { ...objectShort })
        value.count++
        value.totalCount++
        return value
      }
    }, { root: true })
  }
  logD('addNode complete')
}
