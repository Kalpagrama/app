import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'boot/main'
import { apolloProvider } from 'boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context, categories) => {
  // if (context.state.initialized) throw new Error('events state initialized already')
  if (context.state.initialized) return
  logD('node', 'node store init. categories', categories)
  context.commit('init', categories)
  return categories
}

export const nodeUnrate = async (context, oid) => {
  logD('nodeUnrate start')
  if (!oid) return
  let { data: { nodeUnrate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation nodeUnrate ($oid: OID!) {
        nodeUnrate (oid: $oid)
      }
    `,
    variables: {
      oid: oid
    }
  })
  logD('nodeUnrate done', nodeUnrate)
  // update node in apollo cache
  return nodeUnrate
}

export const nodeRate = async (context, { oid, rate }) => {
  logD('nodeRate start', oid, rate)
  if (!oid) throw new Error('No oid!')
  if (!rate) throw new Error('No rate!')
  let { data: { nodeRate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation nodeRate ($oid: OID!, $rate: Float!) {
        nodeRate (oid: $oid, rate: $rate)
      }
    `,
    variables: {
      oid: oid,
      rate: rate
    }
  })
  logD('nodeRate done', nodeRate)
  return nodeRate
}

// export const nodeFull = async (context, oid) => {
//   logD('nodeFull start')
//   logD('nodeFull done')
// }

export const nodeDelete = async (context, oid) => {
  logD('nodeDelete start')
  logD('nodeDelete dones')
}

export const nodeAction = async (context, action) => {
  logD('nodeAction start', action)
  switch (action) {
    case 'confirm': {
      logD('MIX MIX MIX')
      let nodeInput = context.state.nodeOptionsPayload
      delete nodeInput.oid
      context.commit('workspace/stateSet', ['wsItem', {type: 'node', item: nodeInput}], { root: true })
      router.push('/create')
      break
    }
    case 'savenode': {
      logD('SAVE SAVE')
      let nodeInput = context.state.nodeOptionsPayload
      delete nodeInput.oid
      context.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(nodeInput)), { root: true })
      break
    }
  }
  logD('nodeAction done')
}

export const nodeCreate = async (context, node) => {
  logD('nodeCreate start', node)
  // checks
  {
    assert.ok(node.categories.length >= 0)
    assert.ok(node.spheres.length >= 0)
    assert.ok(node.fragments.length >= 0)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
    for (let fr of node.fragments) {
      assert.ok(fr.content)
      assert.ok(fr.cuts.length >= 0)
      assert.ok(fr.scale > 0)
      let fragmentLen = 0
      for (let c of fr.cuts) {
        assert.ok(c.color)
        // assert.ok(c.thumbUrl)
        assert.ok(c.points && c.points.length === 2)
        let start = c.points[0].x
        let end = c.points[1].x
        assert.ok(start >= 0 && end > 0)
        assert.ok(end > start && end <= fr.scale)
        fragmentLen += (end - start)
      }
    }
  }

  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres.map(s => {
    return {name: s.name}
  })
  nodeInput.fragments = node.fragments.map(f => {
    return {
      oid: f.content.oid,
      name: f.name,
      thumbUrl: f.thumbUrl,
      scale: f.scale,
      cuts: f.cuts.map(c => {
        return {
          name: c.name,
          color: c.color,
          thumbUrl: c.thumbUrl,
          points: c.points.map(p => {
            return {
              x: p.x,
              y: p.y,
              z: p.z
            }
          }),
          style: c.style
        }
      })
    }
  })

  logD('nodeCreate nodeInput', nodeInput)
  let { data: { nodeCreate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation nodeCreate ($node: NodeInput!) {
        nodeCreate (node: $node)
      }
    `,
    variables: {
      node: nodeInput
    }
  })
  logD('nodeCreate done', nodeCreate)
  return nodeCreate
}

export const sphereSpheres = async (context, oid) => {
  logD('sphereSpheres start')
  assert.ok(oid)
  let { data: { sphereSpheres: { items: spheres } } } = await apolloProvider.clients.apiApollo.query({
    query: gql`
      query sphereSpheres ($oid: OID!){
        sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
          items {
            oid
            name
          }
        }
      }
    `,
    variables: {
      oid: oid
    }
  })
  logD('sphereSpheres complete')
  return spheres
}

export const sphereNodes = async (context, { oid, pagination, filter, sortStrategy }) => {
  logD('sphereNodes start')
  assert.ok(oid && pagination && filter && sortStrategy)
  let { data: { sphereNodes: { items, count, totalCount, nextPageToken } } } = await apolloProvider.clients.apiApollo.query({
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
  assert.ok(oid && pagination && filter && sortStrategy)
  let { data: { nodeNodes: { items, count, totalCount, nextPageToken } } } = await apolloProvider.clients.apiApollo.query({
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
  let { data: { feed: { items, count, totalCount, nextPageToken } } } = await apolloProvider.clients.apiApollo.query({
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
