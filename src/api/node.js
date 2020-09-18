import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import store from 'src/store/index'
import { ActionEnum, AuthApi } from 'src/api/auth'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

const LinkTypeEnum = Object.freeze({
   CAUSE_EFFECT: 'CAUSE_EFFECT',
   ESSENCE: 'ESSENCE'
})

class NodeApi {
   static async nodeCategories () {
      const f = this.nodeCategories
      logD(f, 'start')
      const t1 = performance.now()
      let { data: { nodeCategories } } = await apollo.clients.auth.query({
         query: gql`
             query nodeCategories{
                 nodeCategories{
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
      return nodeCategories
   }

   static async emojiSpheres () {
      const f = this.emojiSpheres
      logD(f, 'start')
      const t1 = performance.now()
      let { data: { emojiSpheres } } = await apollo.clients.auth.query({
         query: gql`
             query emojiSpheres{
                 emojiSpheres{
                     oid
                     type
                     name
                 }
             }
         `
      })
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return emojiSpheres
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
                     // points: []
                     points: f.points.map(p => {
                        return { x: p.x, y: p.y }
                     })
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
      logD(f, 'start', rate)
      const t1 = performance.now()
      assert(oid, 'oid && rate')
      if (rate > 1) rate = rate / 100
      assert(AuthApi.hasPermitionForAction(ActionEnum.VOTE))
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
      await rxdb.set(RxCollectionEnum.OBJ, createdNode, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      let reactiveNode = await rxdb.get(RxCollectionEnum.OBJ, createdNode.oid)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      let fakeProgressEvent = { type: 'PROGRESS', action: 'CREATE', oid: reactiveNode.oid, progress: 1 }
      assert(store, '!store')
      store.commit('core/processEvent', fakeProgressEvent) // эвент с сервера может придти после создания ядра (а нам необходимо чтобы в state эта инфа уже была)
      return reactiveNode
   }

   static makeJointInput (joint) {
      let chainInput = {}
      assert(joint.leftItem.oid || joint.leftItem.node, '!link.leftItem.oid')
      assert(joint.rightItem.oid || joint.rightItem.node, '!link.rightItem.oid')
      assert(joint.jointType, '!link.type')
      if (joint.leftItem.node) joint.leftItem.node = NodeApi.makeNodeInput(joint.leftItem.node)
      if (joint.rightItem.node) joint.rightItem.node = NodeApi.makeNodeInput(joint.rightItem.node)
      return {
         jointType: joint.jointType,
         leftItem: joint.leftItem,
         rightItem: joint.rightItem,
         name: joint.name
      }
   }

   static async jointCreate (joint) {
      const f = this.jointCreate
      logD(f, 'start')
      const t1 = performance.now()
      let jointInput = NodeApi.makeJointInput(joint)
      logD('jointCreate jointInput', jointInput)
      let { data: { jointCreate: createdJoint } } = await apollo.clients.api.mutate({
         mutation: gql`
             ${fragments.objectFullFragment}
             mutation jointCreate($joint: JointInput!) {
                 jointCreate (joint: $joint){
                     ...objectFullFragment
                 }
             }
         `,
         variables: {
            joint: jointInput
         }
      })
      await rxdb.set(RxCollectionEnum.OBJ, createdJoint, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      let reactiveJoint = await rxdb.get(RxCollectionEnum.OBJ, createdJoint.oid)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return reactiveJoint
   }

   // static async makeLink ({ oidLeft, nodeInputLeft }, { oidRight, nodeInputRight }, linkType, name = '', spheres = []) {
   //    switch (linkType) {
   //       case LinkTypeEnum.CAUSE_EFFECT: {
   //          let chain = {
   //             links: [
   //                { leftItem: { oid: oidLeft }, rightItem: { oid: oidRight }, type: linkType }
   //             ]
   //          }
   //          await NodeApi.chainCreate(chain)
   //          break
   //       }
   //       case LinkTypeEnum.ESSENCE: {
   //          let multiNodeInput = {
   //             layout: 'PIP',
   //             name,
   //             category: 'FUN',
   //             spheres,
   //             items: [{ oid: oidLeft, nodeInput: nodeInputLeft }, { oid: oidRight, nodeInput: nodeInputRight }]
   //                .map(({ oid, nodeInput }) => {
   //                   assert(oid || nodeInput)
   //                   if (oid) return { oid }
   //                   else return NodeApi.makeNodeInput(nodeInput)
   //                })
   //          }
   //          await NodeApi.nodeCreate(multiNodeInput)
   //          break
   //          // временное решение: связываем через сферы
   //          // assert(oidLeft && nodeInputRight, 'oidLeft && nodeInputRight')
   //          // let leftNode = await rxdb.get(RxCollectionEnum.OBJ, oidLeft)
   //          // assert(leftNode && leftNode.sphereFromName, 'leftNode && leftNode.sphereFromName')
   //          // nodeInputRight.spheres.unshift(leftNode.sphereFromName)
   //          // nodeInputRight.spheres.splice(10, nodeInputRight.spheres.length) // удаляем те, что не влезли
   //          // await NodeApi.nodeCreate(nodeInputRight)
   //          // break
   //       }
   //    }
   // }
}

export { NodeApi, LinkTypeEnum }
