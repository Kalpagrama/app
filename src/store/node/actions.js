const debug = require('debug')('[node]:action')
debug.enabled = true

import { apolloProvider } from 'boot/apollo'

export const init = async (context, categories) => {
  // if (context.getters.initialized) throw new Error('events state initialized already')
  if (context.getters.initialized) return
  context.dispatch('log/debug', ['node', 'node store init. categories', categories], { root: true })
  context.commit('init', categories)
  return categories
}

export const nodeUnrate = async (context, oid) => {
  debug('nodeUnrate start')
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
  debug('nodeUnrate done', nodeUnrate)
  // update node in apollo cache
  return nodeUnrate
}

export const nodeRate = async (context, { oid, rate }) => {
  debug('nodeRate start', oid, rate)
  if (!oid) throw new Error(`No oid!`)
  if (!rate) throw new Error(`No rate!`)
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
  debug('nodeRate done', nodeRate)
  return nodeRate
}

export const nodeFull = async (context, oid) => {
  debug('nodeFull start')
  debug('nodeFull done')
}

export const nodeDelete = async (context, oid) => {
  debug('nodeDelete start')
  debug('nodeDelete dones')
}

export const nodeCreate = async (context, payload) => {
  debug('nodeCreate start', payload)
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
  debug('nodeCreate node', node)
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
  debug('nodeCreate done', nodeCreate)
  return nodeCreate
}