import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class NodeApi {
  static async nodeCategories () {
    let f = this.nodeCategories
    logD(f, 'start')
    let { data: { categories } } = await apollo.clients.auth.query({
      query: gql`
        query {
          categories{
            alias
            icon
            name
            sphere{
              oid
              type
              name
            }
            type
          }
        }
      `
    })
    logD(f, 'done')
    return categories
  }

  static makeCompositionInput (composition) {
    assert.ok(composition.layers.length > 0, 'composition.layers.length > 0')
    assert(composition.operation, 'operation')
    let compositionLen = 0
    for (let l of composition.layers) {
      // assert.ok(l.content && l.content.oid, 'l.content && l.content.oid')
      assert(l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10, 'l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10')
      assert.ok(l.figuresAbsolute && l.figuresAbsolute.length === 2, 'l.figuresAbsolute && l.figuresAbsolute.length === 2')
      let start = l.figuresAbsolute[0].t
      let end = l.figuresAbsolute[1].t
      assert.ok(start >= 0 && end > 0, 'start >= 0 && end > 0')
      assert.ok(end > start, 'end > start')
      compositionLen += (end - start)
    }
    assert(compositionLen <= 60, 'compositionLen <= 60 : ' + compositionLen)
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

  static makeNodeInput (node) {
    let f = NodeApi.makeNodeInput
    {
      // checks
      assert.ok(node.category, 'node.category')
      assert.ok(node.spheres.length >= 0 && node.spheres.length <= 10, 'node spheres')
      assert.ok(node.items.length > 0, 'node.items.length > 0')
      assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(node.layout), 'node.layout')
    }
    let nodeInput = {}
    nodeInput.layout = node.layout
    // logD(f, nodeInput, node.spheres, node.spheres.length)
    nodeInput.name = node.name || (node.spheres.length ? node.spheres[0].name : null)
    assert(nodeInput.name, '!nodeInput.name')
    nodeInput.category = node.category || 'FUN'
    nodeInput.spheres = node.spheres.map(s => {
      return { name: s.name, oid: s.oid }
    })
    nodeInput.items = node.items.map(i => {
      return {
        composition: NodeApi.makeCompositionInput(i)
      }
    })
    return nodeInput
  }

  static makeChainInput (chain) {
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
      let resultLink = { name: link.name, type: link.type }
      if (link.leftOid) resultLink.leftOid = link.leftOid
      if (link.leftSphere) resultLink.leftSphere = link.leftSphere
      if (link.leftNode) resultLink.leftNode = NodeApi.makeNodeInput(link.leftNode)
      if (link.leftComposition) resultLink.leftComposition = NodeApi.makeCompositionInput(link.leftComposition)
      if (link.rightOid) resultLink.rightOid = link.rightOid
      if (link.rightSphere) resultLink.rightSphere = link.rightSphere
      if (link.rightNode) resultLink.rightNode = NodeApi.makeNodeInput(link.rightNode)
      if (link.rightComposition) resultLink.rightComposition = NodeApi.makeCompositionInput(link.rightComposition)
      return resultLink
    })
    return chainInput
  }

  static async nodeUnrate (oid) {
    let f = this.nodeUnrate
    logD(f, 'start')
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
    logD(f, 'start')
    // todo update node in apollo cache
    return nodeUnrate
  }

  // общая оценка ядра придет с эвентом
  static async nodeVote (oid, rate) {
    let f = this.nodeVote
    logD(f, 'start')
    assert(oid && rate, 'oid && rate')
    let { data: { nodeRate } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation nodeVote ($oid: OID!, $rate: Float!) {
          nodeRate (oid: $oid, rate: $rate){
            oid
            rate
            rateUser
          }
        }
      `,
      variables: {
        oid: oid,
        rate: rate
      }
    })
    // надо запомнить сейчас, тк эвентом придет только общая оценка
    let nodeFull = await rxdb.get(RxCollectionEnum.OBJ, oid)
    if (nodeFull) {
      // logD(f, `try change rateUser for ${nodeFull.id}`, nodeFull)
      nodeFull.rateUser = rate // nodeFull реактивен!
      logD(f, `done rateUser=${nodeFull.rateUser}`)
    }
    return rate
  }

  static async nodeDelete (oid) {
    logD('nodeDelete start')
    assert.ok(oid)
    let { data: { deleteObject } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation nodeDelete($oid: OID!) {
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

  static async nodeCreate (node) {
    let f = this.nodeCreate
    logD(f, 'start', node)
    let nodeInput = NodeApi.makeNodeInput(node)
    let { data: { nodeCreate: createdNode } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation nodeCreate($node: NodeInput!) {
          nodeCreate (node: $node){
            ...objectFullFragment
          }
        }
      `,
      variables: {
        node: nodeInput
      }
    })
    let reactiveNode = await rxdb.set(RxCollectionEnum.OBJ, createdNode, {actualAge: 'zero'}) // поместим ядро в кэш (на всяк случай)
    logD(f, 'done')
    return createdNode
  }

  static async chainCreate (chain) {
    let f = this.chainCreate
    logD(f, 'start')
    let chainInput = NodeApi.makeChainInput(chain)
    logD('chainCreate chainInput', chainInput)
    let { data: { chainCreate: createdChain } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation chainCreate($chain: ChainInput!) {
          chainCreate (chain: $chain){
            ...objectFullFragment
          }
        }
      `,
      variables: {
        chain: chainInput
      }
    })
    let reactiveChain = await rxdb.set(RxCollectionEnum.OBJ, createdChain, {actualAge: 'zero'}) // поместим ядро в кэш (на всяк случай)
    logD(f, 'done')
    return createdChain
  }
}

export { NodeApi }
