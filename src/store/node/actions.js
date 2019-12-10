import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

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

  let nodeInput = {}
  nodeInput.name = node.name
  nodeInput.categories = node.categories
  nodeInput.spheres = node.spheres
  nodeInput.fragments = node.fragments.map((f, fi) => {
    return {
      oid: f.content.oid,
      name: f.name,
      thumbUrl: f.thumbUrl,
      relativePoints: node.meta.fragments[fi].relativeCuts.reduce((acc, val) => {
        acc.push({x: val.start})
        acc.push({x: val.end})
        return acc
      }, []),
      relativeScale: f.relativeScale
    }
  })
  nodeInput.meta = {
    layout: node.meta.layout,
    fragments: node.meta.fragments.map((f, fi) => {
      return {
        // oid: node.fragments[fi].content.oid,
        thumbUrl: f.thumbUrl,
        relativeCuts: f.relativeCuts.map((c, ci) => {
          return {start: c.start, end: c.end, name: c.name, type: c.type, thumbUrl: c.thumbUrl}
        })
      }
    })
  }

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
