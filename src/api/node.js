import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)
import store from 'src/store/index'

class NodeApi {
   static async nodeCategories () {
      const f = this.nodeCategories
      logD(f, 'start')
      const t1 = performance.now()
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return categories
   }

   static makeCompositionInput (composition) {
      assert.ok(Array.isArray(composition.layers), '!composition.layers')
      assert(composition.operation, 'operation')
      if (composition.layers.length === 0) { // если ничего не выделено - считаем что выделен весь контент
         assert(composition.contentOid)
         composition.layers.push(
            {
               name: '',
               contentOid: composition.contentOid,
               figuresAbsolute: [{
                  points: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }] // квадрат 1х1 пиксель
               }] // весь контент
            }
         )
      }
      let compositionLen = 0
      for (let l of composition.layers) {
         // assert.ok(l.content && l.content.oid, 'l.content && l.content.oid')
         // assert(l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10, 'l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10')
         assert(l.contentOid, 'Layer must contain contentOid !')
         assert(Array.isArray(l.figuresAbsolute), 'Layer figuresAbsolute must be an Array !')
         // if (l.figuresAbsolute.length > 1) {
         //   assert.ok(l.figuresAbsolute.length === 2, 'l.figuresAbsolute && l.figuresAbsolute.length === 2')
         //   let start = l.figuresAbsolute[0].t
         //   let end = l.figuresAbsolute[1].t
         //   assert.ok(start >= 0 && end > 0, 'start >= 0 && end > 0')
         //   assert.ok(end > start, 'end > start')
         //   compositionLen += (end - start)
         // }
      }
      assert(compositionLen <= 60, 'compositionLen <= 60 : ' + compositionLen)
      return {
         thumbUrl: composition.thumbUrl,
         layers: composition.layers.map(l => {
            return {
               name: '',
               contentOid: l.contentOid || l.content.oid,
               speed: l.speed,
               figuresAbsolute: l.figuresAbsolute.map(f => {
                  return {
                     t: f.t,
                     points: [],
                     // points: f.points.map(p => {
                     //    return { x: p.x, y: p.y }
                     // })
                  }
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
      const f = NodeApi.makeNodeInput
      node = cloneDeep(node) // makeNodeInput меняет node
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

   static async nodeUnrate (oid) {
      const f = this.nodeUnrate
      logD(f, 'start')
      const t1 = performance.now()
      if (!oid) return
      let { data: { nodeUnrate } } = await apollo.clients.api.mutate({
         mutation: gql`
             ${fragments.objectFullFragment}
             mutation nodeUnrate ($oid: OID!) {
                 unrate (oid: $oid){
                     ...objectFullFragment
                 }
             }
         `,
         variables: {
            oid: oid
         }
      })
      // todo update node in apollo cache
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return nodeUnrate
   }

   // общая оценка ядра придет с эвентом
   static async nodeVote (oid, rate) {
      const f = this.nodeVote
      logD(f, 'start')
      const t1 = performance.now()
      assert(oid && rate, 'oid && rate')
      let { data: { nodeRate } } = await apollo.clients.api.mutate({
         mutation: gql`
             ${fragments.objectFullFragment}
             mutation rate ($oid: OID!, $rate: Float!) {
                 rate (oid: $oid, rate: $rate){
                     ...objectFullFragment
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
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
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
      const f = this.nodeCreate
      logD(f, 'start', node)
      const t1 = performance.now()
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
      let reactiveNode = await rxdb.set(RxCollectionEnum.OBJ, createdNode, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      let fakeProgressEvent = { type: 'PROGRESS', action: 'CREATE', oid: reactiveNode.oid, progress: 1 }
      assert(store, '!store')
      store.commit('core/processEvent', fakeProgressEvent) // эвент с сервера может придти после создания ядра (а нам необходимо чтобы в state эта инфа уже была)
      return reactiveNode
   }

   static async nodeCreateMulti (nodeInput) {
      logD('nodeCreateMulti start')
      let { data: { nodeCreate: createdNode } } = await apollo.clients.api.mutate({
         mutation: gql`
             ${fragments.objectFullFragment}
             mutation nodeCreateMulti($node: NodeInput!) {
                 nodeCreate (node: $node){
                     ...objectFullFragment
                 }
             }
         `,
         variables: {
            node: nodeInput
         }
      })
      let reactiveNode = await rxdb.set(RxCollectionEnum.OBJ, createdNode, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      logD('nodeCreateMulti done')
      return createdNode
   }

   // chains
   static makeChainInput (chain) {
      {
         // checks
         // assert.ok(chain.spheres.length >= 0 && chain.spheres.length <= 10, 'chain spheres')
         assert.ok(chain.links.length > 0, 'chain.links.length > 0')
         // assert.ok(chain.category, '!chain.category')
      }
      let chainInput = {}
      // chainInput.name = chain.name
      // chainInput.spheres = chain.spheres.map(s => {
      //   return { name: s.name, oid: s.oid }
      // })
      // chainInput.category = chain.category
      chainInput.links = chain.links.map(link => {
         assert(link.leftItem.oid, '!link.leftItem.oid')
         assert(link.rightItem.oid, '!link.rightItem.oid')
         assert(link.type, '!link.type')
         // let resultLink = { name: link.name, type: link.type }
         // if (link.leftOid) resultLink.leftOid = link.leftOid
         // if (link.leftSphere) resultLink.leftSphere = link.leftSphere
         // if (link.leftNode) resultLink.leftNode = NodeApi.makeNodeInput(link.leftNode)
         // if (link.leftComposition) resultLink.leftComposition = NodeApi.makeCompositionInput(link.leftComposition)
         // if (link.rightOid) resultLink.rightOid = link.rightOid
         // if (link.rightSphere) resultLink.rightSphere = link.rightSphere
         // if (link.rightNode) resultLink.rightNode = NodeApi.makeNodeInput(link.rightNode)
         // if (link.rightComposition) resultLink.rightComposition = NodeApi.makeCompositionInput(link.rightComposition)
         return link
      })
      return chainInput
   }

   static async chainCreate (chain) {
      const f = this.chainCreate
      logD(f, 'start')
      const t1 = performance.now()
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
      let reactiveChain = await rxdb.set(RxCollectionEnum.OBJ, createdChain, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return createdChain
   }
}

export { NodeApi }
