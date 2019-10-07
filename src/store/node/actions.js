const debug = require('debug')('[node]:action')
debug.enabled = true

import {apollo} from 'boot/apollo'

export const categories = async (store) => {
  debug('categories start')
  let {data: {categories}} = await apollo.query({
    query: gql`
      query categories {
        categories {
          type
          name
          icon
          sphere {
            oid
            type
            name
          }
        }
      }
    `
  })
  debug('categories done', categories)
  return categories
}

export const nodeUnrate = async (store, oid) => {
  debug('nodeUnrate start')
  if (!oid) return
  let {data: {nodeUnrate}} = await apollo.mutate({
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

export const nodeRate = async (store, {oid, rate}) => {
  debug('nodeRate start', oid, rate)
  if (!oid) throw new Error(`No oid!`)
  if (!rate) throw new Error(`No rate!`)
  let {data: {nodeRate}} = await apollo.mutate({
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

export const nodeFull = async (store, oid) => {
  debug('nodeFull start')
  debug('nodeFull done')
}

export const nodeDelete = async (store, oid) => {
  debug('nodeDelete start')
  debug('nodeDelete dones')
}

export const nodeCreate = async (store, payload) => {
  debug('nodeCreate start', payload)
  if (!payload.fragments || payload.fragments.length === 0) throw new Error('Wrong fragments!')
  let node = {
    name: payload.name || '',
    spheres: [],
    fragments: [],
    meta: {
      layout: 'PIP',
      layoutPolicy: 'DEFAULT',
      fragments: []
    }
  }
  if (payload.parentNode) node.parentNode = payload.parentNode
  let {data: {nodeCreate}} = await apollo.mutate({
    mutation: gql`
      mutation nodePublish ($node: NodeInput!) {
        nodeCreate (node: $node) {
          oid
          type
          name
        }
      }
    `,
    variables: {
      node: node
    }
  })
  debug('nodeCreate done', nodeCreate)
  return nodeCreate
}
