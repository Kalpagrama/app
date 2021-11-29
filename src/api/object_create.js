import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import {assert} from 'src/system/common/utils'
import { fragments } from 'src/api/fragments'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import cloneDeep from 'lodash/cloneDeep'
import { store } from 'src/store/index'
import { apiCall } from 'src/api/index'
import { WsItemTypeEnum } from 'src/system/rxdb/common'
import { ObjectApi } from 'src/api/object'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.API)

class ObjectCreateApi {
   static async emojiSpheres () {
      const f = ObjectCreateApi.emojiSpheres
      logD(f, 'start')
      const t1 = performance.now()
      // const cb = async () => {
      //    let { data: { emojiSpheres } } = await apollo.clients.auth.query({
      //       query: gql`
      //           query emojiSpheres{
      //               emojiSpheres{
      //                   oid
      //                   type
      //                   name
      //               }
      //           }
      //       `
      //    })
      //    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      //    return emojiSpheres
      // }
      // return await apiCall(f, cb)
   }

   static makeCompositionInput (composition) {
      console.log('makeCompositionInput', composition)
      assert(Array.isArray(composition.layers), '!composition.layers')
      composition.operation = composition.operation || { items: null, operations: null, type: 'CONCAT'}
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
         // assert(l.content && l.content.oid, 'l.content && l.content.oid')
         // assert(l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10, 'l.spheres && l.spheres.length >= 0 && l.spheres.length <= 10')
         assert(l.contentOid, 'Layer must contain contentOid !')
         assert(Array.isArray(l.figuresAbsolute), 'Layer figuresAbsolute must be an Array !')
         // if (l.figuresAbsolute.length > 1) {
         //   assert(l.figuresAbsolute.length === 2, 'l.figuresAbsolute && l.figuresAbsolute.length === 2')
         //   let start = l.figuresAbsolute[0].t
         //   let end = l.figuresAbsolute[1].t
         //   assert(start >= 0 && end > 0, 'start >= 0 && end > 0')
         //   assert(end > start, 'end > start')
         //   compositionLen += (end - start)
         // }
      }
      assert(compositionLen <= store.getters.currentUser.settings.quota.nodeMaxDurationSec, 'compositionLen <= nodeMaxDurationSec : ' + compositionLen)
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
      logD(f, 'start', essence)
      essence = cloneDeep(essence) // makeEssenceInput меняет essence
      essence.name = essence.name || ''
      essence.category = essence.category || 'FUN'
      essence.spheres = essence.spheres || []
      essence.layout = essence.layout || 'HORIZONTAL'
      {
         // checks
         assert(essence.category, 'essence.category')
         assert(essence.spheres.length >= 0 && essence.spheres.length <= 10, 'essence spheres')
         assert(essence.items.length > 0 && essence.items.length <= 2, 'essence.items.length > 0')
         assert(['PIP', 'SLIDER', 'VERTICAL', 'HORIZONTAL'].includes(essence.layout), 'essence.layout')
      }
      let essenceInput = {}
      essenceInput.layout = essence.layout
      // logD(f, nodeInput, essence.spheres, essence.spheres.length)
      // nodeInput.name = essence.name || (essence.spheres.length ? essence.spheres[0].name : null)
      // assert(nodeInput.name, '!nodeInput.name')
      essenceInput.name = essence.name
      essenceInput.description = essence.description
      essenceInput.category = essence.category

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
      essenceInput.scope = essence.scope
      return essenceInput
   }

   static makeWsEssence (essenceFull) {
      const f = ObjectCreateApi.makeWsEssence
      essenceFull = cloneDeep(essenceFull) // makeEssenceInput меняет essence
      {
         // checks
         assert(essenceFull.type.in('NODE', 'JOINT', 'BLOCK'), 'type required')
         assert(essenceFull.category, 'essence.category')
         assert(essenceFull.spheres.length >= 0 && essenceFull.spheres.length <= 10, 'essence spheres')
      }
      let essenceInput = {}
      essenceInput.layout = essenceFull.layout
      // logD(f, nodeInput, essence.spheres, essence.spheres.length)
      // nodeInput.name = essence.name || (essence.spheres.length ? essence.spheres[0].name : null)
      // assert(nodeInput.name, '!nodeInput.name')
      essenceInput.name = essenceFull.name
      essenceInput.type = essenceFull.type
      essenceInput.thumbUrl = essenceFull.thumbUrl
      essenceInput.category = essenceFull.category || 'FUN'
      essenceInput.spheres = essenceFull.spheres.map(s => {
         return { name: s.name, oid: s.oid }
      })
      if (essenceFull.type.in('NODE', 'JOINT')){
         essenceInput.items = (essenceFull.items || []).map(i => {
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
      }
      if (essenceFull.type === 'BLOCK'){
         essenceInput.graph = essenceFull.graph
      }
      essenceInput.vertices = essenceFull.vertices || []
      return essenceInput
   }

   static makeBlockInput (block) {
      const f = ObjectCreateApi.makeBlockInput
      block = cloneDeep(block)
      block.spheres = block.spheres || []
      block.category = block.category || 'FUN'
      block.members = block.members || []
      // todo coverImage!
      block.coverImage = block.coverImage || { oid: block.graph.nodes[0].oid, name: block.graph.nodes[0].name }
      {
         // checks
         assert(block.category, 'essence.category')
         assert(block.spheres.length >= 0 && block.spheres.length <= 10, 'essence spheres')
         assert(block.graph && block.graph.nodes && block.graph.joints && block.graph.nodes.length, 'block.graph')
      }
      let blockInput = {}
      // logD(f, nodeInput, essence.spheres, essence.spheres.length)
      // nodeInput.name = essence.name || (essence.spheres.length ? essence.spheres[0].name : null)
      // assert(nodeInput.name, '!nodeInput.name')
      blockInput.rev = block.rev
      blockInput.oid = block.oid
      blockInput.scope = block.scope
      blockInput.name = block.name
      blockInput.description = block.description
      blockInput.coverImage = block.coverImage
      blockInput.category = block.category
      blockInput.spheres = block.spheres.map(s => {
         return { name: s.name, oid: s.oid }
      })
      blockInput.graph = block.graph
      blockInput.members = block.members
      blockInput.graph = {
         nodes: block.graph.nodes.map(n => {
            if (n.oid) return { oid: n.oid }
            else return {essenceInput: ObjectCreateApi.makeEssenceInput(n)}
         }),
         joints: block.graph.joints.map(j => {
            if (j.oid) return { oid: j.oid }
            else return {essenceInput: ObjectCreateApi.makeEssenceInput(j)}
         })
      }
      return blockInput
   }

   static async essenceCreate (essence) {
      const f = ObjectCreateApi.essenceCreate
      logD(f, 'start. essence=', essence)
      const t1 = performance.now()
      const cb = async () => {
         let essenceInput = ObjectCreateApi.makeEssenceInput(essence)
         logD(f, 'essenceInput=', essenceInput)
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
      await ObjectApi.setPublished(reactiveEssence)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return reactiveEssence
   }

   static async jointCreate (joint) {
      const f = ObjectCreateApi.jointCreate
      logD(f, 'start. joint=', joint)
      const t1 = performance.now()
      const cb = async () => {
         let jointInput = ObjectCreateApi.makeEssenceInput(joint)
         logD(f, 'jointInput=', jointInput)
         let { data: { jointCreate: createdJoint } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation jointCreate($joint:  EssenceInput!) {
                    jointCreate (joint: $joint){
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               joint: jointInput
            }
         })
         let reactiveJoint = await rxdb.set(RxCollectionEnum.OBJ, createdJoint, { actualAge: 'day' })
         return reactiveJoint
      }
      let reactiveJoint = await apiCall(f, cb)
      assert(reactiveJoint.relatedSphereOids)
      await rxdb.lists.addRemoveObjectToLists('OBJECT_CREATED', reactiveJoint.relatedSphereOids, reactiveJoint) // вне cb (иначе - дедлок)
      await ObjectApi.setPublished(reactiveJoint)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return reactiveJoint
   }

   static async blockCreate (block) {
      const f = ObjectCreateApi.blockCreate
      logD(f, 'start', block)
      const t1 = performance.now()
      const cb = async () => {
         let blockInput = ObjectCreateApi.makeBlockInput(block)
         let { data: { blockCreate: createdBlock } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.blockFragment}
                mutation blockCreate($block:  BlockInput!) {
                    blockCreate (block: $block){
                        ...blockFragment
                    }
                }
            `,
            variables: {
               block: blockInput
            }
         })
         let reactiveBlock = await rxdb.set(RxCollectionEnum.OBJ, createdBlock, { actualAge: 'day' })
         return reactiveBlock
      }
      let reactiveBlock = await apiCall(f, cb)
      assert(reactiveBlock.relatedSphereOids)
      await rxdb.lists.addRemoveObjectToLists('OBJECT_CREATED', reactiveBlock.relatedSphereOids, reactiveBlock) // вне cb (иначе - дедлок)
      await ObjectApi.setPublished(reactiveBlock)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return reactiveBlock
   }
}

export { ObjectCreateApi }
