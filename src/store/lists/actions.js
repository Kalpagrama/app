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

export const wsItems = async (context, {pagination, filter, sortStrategy }) => {
  logD('wsItems start')
  let { data: { wsItems: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
    query: gql`
      ${fragments.objectFullFragment} ${fragments.objectShortFragment}
      query wsItems ( $pagination: PaginationInput!, $filter: Filter!, $sortStrategy: SortStrategyEnum){
        wsItems (pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
          totalCount
          count
          nextPageToken
          items {
            createdAt
            updatedAt
            spheres {... objectShortFragment}
            wsVersion
            object{ ... objectFullFragment}
            }
        }
      }
    `,
    variables: { pagination, filter, sortStrategy }
  })
  logD('wsItems complete')
  return { items, count, totalCount, nextPageToken }
}

export const sphereNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereNodes start')
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
  logD('sphereNodes complete')
  return { items, count, totalCount, nextPageToken }
}

export const nodeNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('nodeNodes start')
  let { data: { nodeNodes: { items, count, totalCount, nextPageToken } } } = await apollo.clients.api.query({
    query: gql`
      ${fragments.objectShortWithMetaFragment}
      query nodeNodes ($oid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
        nodeNodes (nodeOid: $oid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
          count
          totalCount
          nextPageToken
          items {... objectShortWithMetaFragment}
        }
      }
    `,
    variables: { oid, pagination, filter, sortStrategy }
  })
  logD('nodeNodes complete')
  return { items, count, totalCount, nextPageToken }
}

export const feed = async (context, {pagination}) => {
  logD('feed start')
  assert.ok(pagination)
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
  logD('feed complete')
  return { items, count, totalCount, nextPageToken }
}
