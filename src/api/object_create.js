import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import store from 'src/store/index'
import { apiCall } from 'src/api/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

class ObjectCreateApi {
   static async nodeCategories () {
      const f = ObjectCreateApi.nodeCategories
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
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
      return await apiCall(f, cb)
   }

   static async emojiSpheres () {
      const f = ObjectCreateApi.emojiSpheres
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
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
      return await apiCall(f, cb)
   }

   static makeCompositionInput (composition) {
      assert.ok(Array.isArray(composition.layers), '!composition.layers')
      assert(composition.operation, '!operation')
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
      const f = ObjectCreateApi.makeNodeInput
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
            composition: ObjectCreateApi.makeCompositionInput(i)
         }
      })
      nodeInput.vertices = []
      return nodeInput
   }

   static async nodeCreate (node) {
      const f = ObjectCreateApi.nodeCreate
      logD(f, 'start', node)
      const t1 = performance.now()
      const cb = async () => {
         let nodeInput = ObjectCreateApi.makeNodeInput(node)
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
      return await apiCall(f, cb)
   }

   static makeJointInput (joint) {
      let chainInput = {}
      assert(joint.leftItem.oid || joint.leftItem.nodeInput, '!joint.leftItem.oid')
      assert(joint.rightItem.oid || joint.rightItem.nodeInput, '!joint.rightItem.oid')
      assert(joint.jointType, '!joint.jointType')
      if (joint.leftItem.nodeInput) joint.leftItem.nodeInput = ObjectCreateApi.makeNodeInput(joint.leftItem.nodeInput)
      if (joint.rightItem.nodeInput) joint.rightItem.nodeInput = ObjectCreateApi.makeNodeInput(joint.rightItem.nodeInput)
      return {
         swap: joint.swap || false,
         jointType: joint.jointType,
         leftItem: joint.leftItem,
         rightItem: joint.rightItem,
         name: joint.name
      }
   }

   static async jointCreate (joint) {
      const f = ObjectCreateApi.jointCreate
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let jointInput = ObjectCreateApi.makeJointInput(joint)
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
         let reactiveJoint = await rxdb.set(RxCollectionEnum.OBJ, createdJoint, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return reactiveJoint
      }
      return await apiCall(f, cb)
   }
}

export { ObjectCreateApi }
