import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { router } from 'boot/main'
import { apollo } from 'src/boot/apollo'
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
  let { data: { nodeUnrate } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_nodeUnrate ($oid: OID!) {
        nodeUnrate (oid: $oid){
          oid
          rate
          rateUser
        }
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

export const nodeRate = async (context, { node, rateUser }) => {
  logD('nodeRate start', node.oid, rateUser)
  assert(node.oid && rateUser)
  let { data: { nodeRate } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_nodeRate ($oid: OID!, $rate: Float!) {
        nodeRate (oid: $oid, rate: $rate){
          oid
          rate
          rateUser
        }
      }
    `,
    variables: {
      oid: node.oid,
      rate: rateUser
    },
    optimisticResponse: {
      __typename: 'Mutation',
      nodeRate: {
        __typename: 'Node',
        oid: node.oid,
        rate: node.rate,
        rateUser: rateUser
      }
    }
  })
  logD('nodeRate done', nodeRate)
  return nodeRate.rate
}

// export const nodeFull = async (context, oid) => {
//   logD('nodeFull start')
//   logD('nodeFull done')
// }

export const nodeDelete = async (context, oid) => {
  logD('nodeDelete start')
  assert.ok(oid)
  let { data: { deleteObject } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_deleteNode($oid: OID!) {
        deleteObject (oid: $oid)
      }
    `,
    variables: {
      oid: oid
    }
  })
  logD('nodeDelete dones')
  return deleteObject
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
  let { data: { nodeCreate } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation sw_network_only_nodeCreate ($node: NodeInput!) {
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
