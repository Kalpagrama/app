import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  logD('node/init')
  if (context.state.initialized) return
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

export const nodeCreate = async (context, node) => {
  logD('nodeCreate start', node)
  // checks
  {
    assert.ok(node.category, 'node.category')
    assert.ok(node.spheres.length >= 0 && node.spheres.length <= 10, 'node spheres')
    assert.ok(node.compositions.length > 0, 'node.compositions.length > 0')
    assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout), 'node.layout')
    for (let c of node.compositions) {
      assert.ok(c.layers.length > 0)
      // assert(c.spheres && c.spheres.length >= 0 && c.spheres.length <= 10, 'c.spheres')
      assert(c.operation, 'c.operation')
      let compositionLen = 0
      for (let l of c.layers) {
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
    }
  }

  let nodeInput = {}
  nodeInput.layout = node.layout
  nodeInput.name = node.name
  nodeInput.category = node.category || 'FUN'
  nodeInput.spheres = node.spheres.map(s => {
    return { name: s.name }
  })
  nodeInput.compositions = node.compositions.map(c => {
    return {
      thumbUrl: c.thumbUrl,
      spheres: c.spheres ? c.spheres.map(s => ({ name: s.name })) : [],
      layers: c.layers.map(l => {
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
        items: c.operation.items,
        operations: c.operation.operations,
        type: c.operation.type
      }
    }
  })

  logD('nodeCreate nodeInput', nodeInput)
  let { data: { nodeCreate: createdNode } } = await apollo.clients.api.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation nodeCreate ($node: NodeInput!) {
        nodeCreate (node: $node){
          ...objectFullFragment
        }
      }
    `,
    variables: {
      node: nodeInput
    }
  })
  context.dispatch('cache/update', {key: createdNode.oid, newValue: createdNode, actualAge: 'zero'}, {root: true})
  await context.dispatch('workspace/exportLayersFromNode', node, { root: true }) // сохраним слои из созданного ядра в мастерской
  logD('nodeCreate done', nodeCreate)
  return nodeCreate
}
