import { logD } from 'src/boot/log'

import { apolloProvider } from 'boot/apollo'
import assert from 'assert'

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

export const nodeFull = async (context, oid) => {
  logD('nodeFull start')
  logD('nodeFull done')
}

export const nodeDelete = async (context, oid) => {
  logD('nodeDelete start')
  logD('nodeDelete dones')
}

export const nodeCreate = async (context, node) => {
  logD('nodeCreate start', node)

  let nodeex = {
    name: 'test name', // от 1 до 180
    categories: ['POLITICS'], // от 1 до 3
    spheres: [], // от нуля до 10
    layout: 'PIP', // PIP, HORIZONTAL, VERTICAL, SLIDER
    // превью ядра
    thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    fragments: [{ // от 1 до 2
      name: 'fragment1 name',
      contentOid: 'AmiFT0MCoGI=',
      thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
      width: 600,
      height: 450,
      color: 'black',
      relativeScale: 1000,
      relativeCuts: [{ // минимум 1 cut
        start: 100, // 0 - relativeScale
        end: 200, // (start+1) - relativeScale
        name: 'relativeCut1 name',
        type: 'reserved...',
        thumbUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
      }]
    }
    ]
  }

  // checks
  {
    assert.ok(node.categories.length >= 1 && node.categories.length <= 3)
    assert.ok(node.spheres.length >= 0 && node.spheres.length <= 10)
    assert.ok(node.name.length > 0 && node.name.length < 180)
    assert.ok(node.fragments.length >= 1 && node.fragments.length <= 2)
    assert.ok(node.layout)
    for (let fr of node.fragments) {
      assert.ok(fr.relativeCuts.length > 0)
      for (let rc of fr.relativeCuts) {
        assert.ok(fr.relativeScale > 0 && rc.start >= 0 && rc.end > 0)
        assert.ok(rc.end > rc.start && rc.end <= fr.relativeScale)
      }
    }
  }

  let nodeInput = {}
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres
  nodeInput.fragments = node.fragments.map(fr => {
    return {
      name: fr.name,
      oid: fr.contentOid,
      thumbUrl: fr.thumbUrl,
      relativeScale: fr.relativeScale,
      relativePoints: fr.relativeCuts.reduce((acc, val) => {
        acc.push({ x: val.start })
        acc.push({ x: val.end })
        return acc
      }, [])
    }
  })
  nodeInput.meta = {
    layout: node.layout,
    thumbUrl: node.thumbUrl,
    fragments: node.fragments.map(fr => ({
      width: fr.width,
      height: fr.height,
      color: fr.color,
      thumbUrl: fr.thumbUrl,
      relativeCuts: fr.relativeCuts
    }))
  }

  logD('nodeCreate node', nodeInput)
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
