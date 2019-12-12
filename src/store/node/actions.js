import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apolloProvider } from 'boot/apollo'
import assert from 'assert'

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

export const nodeCreate = async (context, node) => {
  logD('nodeCreate start', node)

  // let nodeFull = {
  //   layout: 'PIP', // "PIP", "SLIDER", "VERTICAL", "HORIZONTAL"
  //   name: 'AAA',
  //   fragments: [
  //     {
  //       name: '',
  //       thumbUrl: '',
  //       scale: 1000,
  //       cuts: [
  //         {
  //           name: '',
  //           color: '', // cutCreate () => {color: $randomColor(Date.now().toString())}
  //           thumbUrl: '',
  //           points: [{ x: 0 }, { x: 20, y: null }],
  //           style: null
  //         }
  //       ]
  //     }
  //   ],
  //   content: {}
  // }

  // checks
  {
    assert.ok(node.categories.length >= 1 && node.categories.length < 4)
    assert.ok(node.spheres.length >= 0 && node.spheres.length < 10)
    assert.ok(node.fragments.length === 2)
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout))
    for (let fr of node.fragments) {
      assert.ok(fr.content)
      assert.ok(fr.cuts.length > 0)
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
      let sixtySec = (60 * fr.scale) / node.content.duration
      assert.ok(fragmentLen <= sixtySec)
    }
  }

  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres
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
    variables: { node: nodeInput}
  })
  logD('nodeCreate done', nodeCreate)
  return nodeCreate
}
