import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  logD('node/init')

  const fetchItemFunc = async () => {
    let { data: { categories } } = await apollo.clients.api.query({
      query: gql`
        query categories {
          categories {
            type
            name
            alias
            icon
            sphere {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
            }
          }
        }`
    })
    return {
      item: categories,
      actualAge: 'day'
    }
  }
  let categories = await context.dispatch('cache/get', { key: 'categories', fetchItemFunc }, { root: true })
  if (context.state.initialized) return
  context.commit('init', categories)
  logD('node/init done')
  return categories
}

export const nodeUnrate = async (context, oid) => {
  logD('nodeUnrate start')
  if (!oid) return
  let { data: { nodeUnrate } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation nodeUnrate ($oid: OID!) {
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
      mutation nodeRate ($oid: OID!, $rate: Float!) {
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
    }
  })
  // надо запомнить сейчас, тк с фвентом придет только общая оценка
  await context.dispatch('cache/update', {
    key: node.oid,
    path: 'rateUser',
    newValue: rateUser
  }, { root: true })
  logD('nodeRate done', nodeRate)
  return nodeRate.rate
}

export const nodeDelete = async (context, oid) => {
  logD('nodeDelete start')
  assert.ok(oid)
  let { data: { deleteObject } } = await apollo.clients.api.mutate({
    mutation: gql`
      mutation deleteNode($oid: OID!) {
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

function makeCompositionInput (composition){
  assert.ok(composition.layers.length > 0)
  assert(composition.operation, 'operation')
  let compositionLen = 0
  for (let l of composition.layers) {
    assert.ok(l.content && l.content.oid)
    assert(l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10)
    assert.ok(l.figuresAbsolute && l.figuresAbsolute.length === 2)
    let start = l.figuresAbsolute[0].t
    let end = l.figuresAbsolute[1].t
    assert.ok(start >= 0 && end > 0)
    assert.ok(end > start)
    compositionLen += (end - start)
  }
  assert(compositionLen <= 60)
  return {
    thumbUrl: composition.thumbUrl,
    spheres: composition.spheres ? composition.spheres.map(s => ({ name: s.name })) : [],
    layers: composition.layers.map(l => {
      return {
        contentOid: l.contentOid || l.content.oid,
        speed: l.speed,
        figuresAbsolute: l.figuresAbsolute.map(f => {
          return {
            t: f.t,
            points: f.points.map(p => {
              return { x: p.x, y: p.y }
            })
          }
        }),
        spheres: l.spheres.map(s => {
          return { name: s.name }
        }),
        color: l.color,
        thumbUrl: l.thumbUrl
      }
    }),
    operation: {
      items: composition.operation.items,
      operations: composition.operation.operations,
      type: composition.operation.type
    }
  }
}
function makeNodeInput (node){
  {
    // checks
    assert.ok(node.category, 'node.category')
    assert.ok(node.spheres.length >= 0 && node.spheres.length <= 10, 'node spheres')
    assert.ok(node.items.length > 0, 'node.items.length > 0')
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout), 'node.layout')
  }
  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.category = node.category || 'FUN'
  nodeInput.spheres = node.spheres.map(s => {
    return { name: s.name, oid: s.oid }
  })
  nodeInput.items = node.items.map(composition => {
    return makeCompositionInput(composition)
  })
  return nodeInput
}
function makeChainInput (chain){
  {
    // checks
    assert.ok(chain.spheres.length >= 0 && chain.spheres.length <= 10, 'chain spheres')
    assert.ok(chain.links.length > 0, 'chain.links.length > 0')
  }
  let chainInput = {}
  chainInput.name = chain.name
  chainInput.spheres = chain.spheres.map(s => {
    return { name: s.name, oid: s.oid }
  })
  chainInput.links = chain.links.map(link => {
    assert(link.leftOid || link.leftSphere || link.leftNode || link.leftComposition, '!link.leftOid')
    assert(link.rightOid || link.rightSphere || link.rightNode || link.rightComposition, 'link.rightOid')
    assert(link.type, '!link.type')
    let resultLink = {name: link.name, type: link.type}
    if (link.leftOid) resultLink.leftOid = link.leftOid
    if (link.leftSphere) resultLink.leftSphere = link.leftSphere
    if (link.leftNode) resultLink.leftNode = makeNodeInput(link.leftNode)
    if (link.leftComposition) resultLink.leftComposition = makeCompositionInput(link.leftComposition)
    if (link.rightOid) resultLink.rightOid = link.rightOid
    if (link.rightSphere) resultLink.rightSphere = link.rightSphere
    if (link.rightNode) resultLink.rightNode = makeNodeInput(link.rightNode)
    if (link.rightComposition) resultLink.rightComposition = makeCompositionInput(link.rightComposition)
    return resultLink
  })
  return chainInput
}

export const nodeCreate = async (context, node) => {
  logD('nodeCreate start', node)
  let nodeInput = makeNodeInput(node)
  logD('nodeCreate nodeInput', nodeInput)
  let { data: { nodeCreate: createdNode } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation ($node: NodeInput!) {
        nodeCreate (node: $node){
          ...objectFullFragment
        }
      }
    `,
    variables: {
      node: nodeInput
    }
  })
  context.dispatch('cache/update', { key: createdNode.oid, newValue: createdNode, actualAge: 'zero' }, { root: true })
  await context.dispatch('workspace/exportLayersFromNode', node, { root: true }) // сохраним слои из созданного ядра в мастерской
  logD('nodeCreate done', createdNode)
  return createdNode
}

export const chainCreate = async (context, chain) => {
  logD('chainCreate start', chain)
  let chainInput = makeChainInput(chain)
  logD('chainCreate chainInput', chainInput)
  let { data: { chainCreate: createdChain } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation ($chain: ChainInput!) {
        chainCreate (chain: $chain){
          ...objectFullFragment
        }
      }
    `,
    variables: {
      chain: chainInput
    }
  })
  context.dispatch('cache/update', { key: createdChain.oid, newValue: createdChain, actualAge: 'zero' }, { root: true })
  logD('chainCreate done', createdChain)
  return createdChain
}
export const rate = async (context, { oid, rateUser }) => {
  // todo
}
export const unrate = async (context, { oid, rateUser }) => {
// todo
}
