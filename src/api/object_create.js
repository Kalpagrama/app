import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
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
   // static async nodeCategories () {
   //    const f = ObjectCreateApi.nodeCategories
   //    logD(f, 'start')
   //    const t1 = performance.now()
   //    const cb = async () => {
   //       let { data: { nodeCategories } } = await apollo.clients.auth.query({
   //          query: gql`
   //              query nodeCategories{
   //                  nodeCategories{
   //                      alias
   //                      icon
   //                      name
   //                      sphere{
   //                          oid
   //                          type
   //                          name
   //                      }
   //                      type
   //                  }
   //              }
   //          `
   //       })
   //       logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   //       return nodeCategories
   //    }
   //    return await apiCall(f, cb)
   // }

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
      console.log('makeCompositionInput', composition)
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
               // name: '',
               contentOid: l.contentOid || l.content.oid,
               // speed: l.speed,
               figuresAbsolute: l.figuresAbsolute.map(f => {
                  return {
                     t: f.t,
                     // points: []
                     points: f.points.map(p => {
                        return { x: p.x, y: p.y }
                     }),
                     epubCfi: f.epubCfi,
                     epubCfiText: f.epubCfiText
                  }
               }),
               // color: l.color,
               // thumbUrl: l.thumbUrl
            }
         }),
         operation: {
            items: composition.operation.items,
            operations: composition.operation.operations,
            type: composition.operation.type
         }
      }
   }

   static makeEssenceInput (essence) {
      const f = ObjectCreateApi.makeEssenceInput
      essence = cloneDeep(essence) // makeEssenceInput меняет essence
      {
         // checks
         assert.ok(essence.category, 'essence.category')
         assert.ok(essence.spheres.length >= 0 && essence.spheres.length <= 10, 'essence spheres')
         assert.ok(essence.items.length > 0 && essence.items.length <= 2, 'essence.items.length > 0')
         assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(essence.layout), 'essence.layout')
      }
      let essenceInput = {}
      essenceInput.layout = essence.layout
      // logD(f, nodeInput, essence.spheres, essence.spheres.length)
      // nodeInput.name = essence.name || (essence.spheres.length ? essence.spheres[0].name : null)
      // assert(nodeInput.name, '!nodeInput.name')
      essenceInput.name = essence.name
      essenceInput.category = essence.category || 'FUN'
      essenceInput.spheres = essence.spheres.map(s => {
         return { name: s.name, oid: s.oid }
      })
      essenceInput.items = essence.items.map(i => {
         // let itemInput
         if (i.oid) {
            return {
               oid: i.oid
            }
         }
         else if (i.layers || i.compositionInput) {
            return {
               compositionInput: ObjectCreateApi.makeCompositionInput(i.compositionInput || i)
            }
         }
         else {
            return {
               essenceInput: ObjectCreateApi.makeEssenceInput(i)
            }
         }
         // if (i.layers) itemInput = ObjectCreateApi.makeCompositionInput(i)
         // else if (i.oid) itemInput = {oid: i.oid}
         // else itemInput = ObjectCreateApi.makeEssenceInput(i)
         // return itemInput
         // return {
         //    compositionInput: ObjectCreateApi.makeCompositionInput(i)
         // }
      })
      essenceInput.vertices = essence.vertices || []
      return essenceInput
   }

   static makeWsEssence (essenceFull) {
      const f = ObjectCreateApi.makeWsEssence
      essenceFull = cloneDeep(essenceFull) // makeEssenceInput меняет essence
      {
         // checks
         assert(essenceFull.type.in('NODE', 'JOINT'), 'type required')
         assert.ok(essenceFull.category, 'essence.category')
         assert.ok(essenceFull.spheres.length >= 0 && essenceFull.spheres.length <= 10, 'essence spheres')
         assert.ok(essenceFull.items.length > 0 && essenceFull.items.length <= 2, 'essence.items.length > 0')
         assert.ok(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(essenceFull.layout), 'essence.layout')
      }
      let type = essenceFull.type
      let essenceInput = {}
      essenceInput.layout = essenceFull.layout
      // logD(f, nodeInput, essence.spheres, essence.spheres.length)
      // nodeInput.name = essence.name || (essence.spheres.length ? essence.spheres[0].name : null)
      // assert(nodeInput.name, '!nodeInput.name')
      essenceInput.name = essenceFull.name
      essenceInput.category = essenceFull.category || 'FUN'
      essenceInput.spheres = essenceFull.spheres.map(s => {
         return { name: s.name, oid: s.oid }
      })
      essenceInput.items = essenceFull.items.map(i => {
         if (i.layers || i.compositionInput) {
            return ObjectCreateApi.makeCompositionInput(i.compositionInput || i)
         }
         else {
            return {
               essenceInput: ObjectCreateApi.makeEssenceInput(i)
            }
         }
         // if (i.layers) itemInput = ObjectCreateApi.makeCompositionInput(i)
         // else if (i.oid) itemInput = {oid: i.oid}
         // else itemInput = ObjectCreateApi.makeEssenceInput(i)
         // return itemInput
         // return {
         //    compositionInput: ObjectCreateApi.makeCompositionInput(i)
         // }
      })
      essenceInput.vertices = essenceFull.vertices || []
      return essenceInput
   }

   static async essenceCreate (essence) {
      const f = ObjectCreateApi.essenceCreate
      logD(f, 'start', essence)
      const t1 = performance.now()
      const cb = async () => {
         let essenceInput = ObjectCreateApi.makeEssenceInput(essence)
         console.log('essenceInput', essenceInput)
         let { data: { essenceCreate: createdEssence } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation essenceCreate($essence:  EssenceInput!) {
                    essenceCreate (essence: $essence){
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               essence: essenceInput
            }
         })
         let reactiveEssence = await rxdb.set(RxCollectionEnum.OBJ, createdEssence, { actualAge: 'day' })
         return reactiveEssence
      }
      let reactiveEssence = await apiCall(f, cb)
      assert(reactiveEssence.relatedSphereOids)
      await rxdb.lists.addRemoveObjectToLists('OBJECT_CREATED', reactiveEssence.relatedSphereOids, reactiveEssence) // вне cb (иначе - дедлок)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      assert(store, '!store')
      return reactiveEssence
   }

   static makeJointInput (joint) {
      let chainInput = {}
      assert(joint.leftItem.oid || joint.leftItem.nodeInput, '!joint.leftItem.oid')
      assert(joint.rightItem.oid || joint.rightItem.nodeInput, '!joint.rightItem.oid')
      assert(joint.jointType, '!joint.jointType')
      if (joint.leftItem.nodeInput) joint.leftItem.nodeInput = ObjectCreateApi.makeEssenceInput(joint.leftItem.nodeInput)
      if (joint.rightItem.nodeInput) joint.rightItem.nodeInput = ObjectCreateApi.makeEssenceInput(joint.rightItem.nodeInput)
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
      // const t1 = performance.now()
      // const cb = async () => {
      //    let jointInput = ObjectCreateApi.makeJointInput(joint)
      //    logD('jointCreate jointInput', jointInput)
      //    let { data: { jointCreate: createdJoint } } = await apollo.clients.api.mutate({
      //       mutation: gql`
      //           ${fragments.objectFullFragment}
      //           mutation jointCreate($joint: JointInput!) {
      //               jointCreate (joint: $joint){
      //                   ...objectFullFragment
      //               }
      //           }
      //       `,
      //       variables: {
      //          joint: jointInput
      //       }
      //    })
      //    let reactiveJoint = await rxdb.set(RxCollectionEnum.OBJ, createdJoint, { actualAge: 'zero' }) // поместим ядро в кэш (на всяк случай)
      //    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      //    return reactiveJoint
      // }
      // return await apiCall(f, cb)
      return await ObjectCreateApi.essenceCreate(joint)
   }
}

export { ObjectCreateApi }
