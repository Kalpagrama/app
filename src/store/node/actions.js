import { logD } from 'src/boot/log'

import { apolloProvider } from 'boot/apollo'

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

export const nodeCreate = async (context, payload) => {
  logD('nodeCreate start', payload)
  if (!payload.fragments || payload.fragments.length === 0) throw new Error('Wrong fragments!')
  let node = {
    name: payload.name || '',
    spheres: payload.spheres.map(s => ({ name: s.name, oid: s.oid })),
    categories: payload.categories,
    fragments: payload.fragments.map(f => {
      return {
        uid: f.uid,
        name: f.name,
        oid: f.content.oid,
        relativePoints: f.relativeCuts.reduce((acc, val) => {
          acc.push({x: val.start})
          acc.push({x: val.end})
          return acc
        }, []),
        relativeScale: f.relativeScale
      }
    }),
    meta: {
      layout: 'PIP',
      fragments: payload.fragments.map(f => ({ uid: f.uid, color: 'black' }))
    }
  }
  if (payload.parentNode) node.parentNode = payload.parentNode
  logD('nodeCreate node', node)
  let { data: { nodeCreate } } = await apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation nodePublish ($node: NodeInput!) {
        nodeCreate (node: $node)
      }
    `,
    variables: {
      node: node
    }
  })
  logD('nodeCreate done', nodeCreate)
  return nodeCreate
}
