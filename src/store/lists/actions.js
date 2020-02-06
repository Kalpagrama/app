import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

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
  let { data: { sphereSpheres: { items: spheres } } } = await apollo.clients.api.query({
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
  logD('sphereSpheres complete')
  return spheres
}

export const events = async (context, { pagination }) => {
  logD('events start')
  assert(pagination.pageSize)
  let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
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
  logD('events complete')
  return { items, count, totalCount, nextPageToken }
}

// вернет список из кэша, либо null(тогда надо брать из сети)
function getCachedList (context, { pagination, filter, sortStrategy }) {
  let key = JSON.stringify(filter) + JSON.stringify(sortStrategy)
  let { items, count, totalCount, nextPageToken } = context.state.wsItems[key]
  assert(items.length === count && totalCount >= count)
  if (items) {
    assert(Array.isArray(items))
    let firstIndx = 0
    if (pagination && pagination.pageToken && pagination.pageToken.lastOid) {
      assert(pagination.pageToken.direction === 'forward', 'non forward directions not implemented!')
      firstIndx = Math.max(0, items.findIndex(item => {
        let oid = item.oid || item.object.oid
        return oid === pagination.pageToken.lastOid
      }))
    }
    let resultItems = items.slice(firstIndx, pagination.pageSize)
    if (resultItems.length < pagination.pageSize && totalCount > count) {
      return null // в кэше данных недостаточно. запросить с сервера
    }
    let resultNextPageToken = { ...nextPageToken }
    if (resultItems.length) {
      let lastItem = resultItems[resultItems.length - 1]
      resultNextPageToken.lastOid = lastItem.oid || lastItem.object.oid
    }
    // let nextPageToken = {lastOid: 0, direction: 'forward'}
    return { items: resultItems, count: resultItems.length, totalCount, nextPageToken: resultNextPageToken }
  }
}

function setCachedList (context, { pagination, filter, sortStrategy }) {

}

export const wsItems = async (context, { pagination, filter, sortStrategy }) => {
  logD('wsItems start')
  const fetchItemFunc = async () => {
    let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectFullFragment} ${fragments.objectShortFragment}
        query wsItems ( $pagination: PaginationInput!, $filter: Filter!, $sortStrategy: SortStrategyEnum){
          wsItems (pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
            totalCount
            count
            nextPageToken
            items {... objectShortFragment}
          }
        }
      `,
      variables: { pagination, filter, sortStrategy }
    })
    return {
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }

  logD('wsItems complete')
  let { items, count, totalCount, nextPageToken } = await context.dispatch('cache/get',
    { key: 'wsItems: ' + JSON.stringify({ pagination, filter, sortStrategy }), fetchItemFunc }, { root: true })
  return { items, count, totalCount, nextPageToken }
}

export const sphereNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereNodes start')
  const fetchItemFunc = async () => {
    let { data: { sphereNodes: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query sphereNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
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
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  let { items, count, totalCount, nextPageToken } = await context.dispatch('cache/get',
    { key: 'sphereNodes: ' + JSON.stringify({ oid, pagination, filter, sortStrategy }), fetchItemFunc }, { root: true })
  logD('sphereNodes complete')
  return { items, count, totalCount, nextPageToken }
}

export const nodeNodes = async (context, { node, position, pagination, sortStrategy }) => {
  logD('nodeNodes start')
  assert(position >= 1 && position <= 3)
  assert(node.compositions && node.compositions.length === 2)
  assert(node.oid && node.sphereFromName && node.sphereFromName.oid)
  const fetchItemFunc = async () => {
    let filter = { types: ['NODE'] }
    let oid
    if (position === 1) { // список для верхней части кубика-рубика (первая композици)
      oid = node.compositions[0].oid // запрашиваем ядра первой композиции
      filter.name = node.name
      filter.compositionOids = [node.compositions[1].oid]
    } else if (position === 2) { // список для средней части кубика-рубика (суть)
      oid = node.sphereFromName.oid // запрашиваем ядра на суть
      filter.compositionOids = [node.compositions[0].oid, node.compositions[1].oid]
    } else if (position === 3) { // список для нижней части кубика-рубика (вторая композиция)
      oid = node.compositions[0].oid // запрашиваем ядра второй композиции
      filter.name = node.name
      filter.compositionOids = [node.compositions[0].oid]
    }
    let { data: { sphereNodes: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
      query: gql`
        ${fragments.objectShortWithMetaFragment}
        query nodeNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
          sphereNodes (sphereOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
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
      item: { items, count, totalCount, nextPageToken },
      actualAge: 'hour'
    }
  }
  let { items, count, totalCount, nextPageToken } = await context.dispatch('cache/get',
    {
      key: 'nodeNodes: ' + JSON.stringify({ oid: node.oid, position, pagination, sortStrategy }),
      fetchItemFunc
    }, { root: true })
  logD('nodeNodes complete')
  return { items, count, totalCount, nextPageToken }
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
  let { items, count, totalCount, nextPageToken } = await context.dispatch('cache/get',
    { key: 'feed: ' + JSON.stringify({ pagination }), fetchItemFunc }, { root: true })
  logD('feed complete')
  return { items, count, totalCount, nextPageToken }
}
