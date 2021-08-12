import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
import { rxdb, RxCollectionEnum, makeId } from 'src/system/rxdb'
import {assert} from 'src/system/utils'
import { ActionEnum, AuthApi } from 'src/api/auth'
import { apiCall } from 'src/api/index'
import { updateRxDocPayload } from 'src/system/rxdb/reactive'
import throttle from 'lodash/throttle'
import { ObjectCreateApi } from 'src/api/object_create'
import { ContentApi } from 'src/api/content'
import store from 'src/store'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

const StatKeyEnum = Object.freeze({
   VIEWED_TIME: 'VIEWED_TIME',
   BOOKMARKED: 'BOOKMARKED',
   SHARED: 'SHARED',
   REMADE: 'REMADE'
})

let statAccumulator = []

const updateStatThrottled = throttle(async () => {
   const f = updateStatThrottled
   f.nameExtra = 'updateStatThrottled'
   const t1 = performance.now()
   logD(f, 'start updateStatThrottled')
   try {
      if (!statAccumulator.length) return
      const cb = async () => {
         let { data: { updateStat } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation ($stats: [StatDataInput!]!) {
                    updateStat (stats: $stats)
                }
            `,
            variables: {
               stats: statAccumulator
            }
         })
         return updateStat
      }
      let res = await apiCall(f, cb)
      for (let { oid, key, valueInt } of statAccumulator) {
         switch (key) {
            case StatKeyEnum.REMADE:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countStat.countRemakes', countRemakes => countRemakes + 1, false)
               break
            case StatKeyEnum.SHARED:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countStat.countShares', countShares => countShares + 1, false)
               break
            case StatKeyEnum.VIEWED_TIME:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countStat.countViews', countViews => countViews + 1, false)
               break
            case StatKeyEnum.BOOKMARKED:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countStat.countBookmarks', countBookmarks => countBookmarks + 1, false)
               break
         }
      }
      return res
   } finally {
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec ${statAccumulator.length}`)
      statAccumulator = []
   }
}, 1000 * 30, { leading: false }) // шлем не чаще чем раз в 30 сек

class ObjectApi {
   static fileToDataUrl (file) {
      return new Promise((resolve, reject) => {
         const reader = new FileReader()
         reader.readAsDataURL(file)
         reader.onload = () => resolve(reader.result)
         reader.onerror = error => reject(error)
      })
   }

   static async objectListAllTest () {
      const f = ObjectApi.objectListAllTest
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         const t2 = performance.now()
         let { data: { testAllEssence } } = await apollo.clients.api.query({
            query: gql`
                ${fragments.objectFullFragment}
                query {
                    testAllEssence {
                        ... objectFullFragment
                    }
                }
            `
         })
         // logD('objectList=', objectList)
         logD(f, `complete: ${Math.floor(performance.now() - t1)}/${Math.floor(performance.now() - t2)} msec`)
         return testAllEssence
      }
      return await apiCall(f, cb)
   }

   static async objectList (oids) {
      const f = ObjectApi.objectList
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         const t2 = performance.now()
         let { data: { objectList } } = await apollo.clients.api.query({
            query: gql`
                ${fragments.objectFullFragment}
                query objectList ($oids: [OID!]!) {
                    objectList(oids: $oids) {
                        ... objectFullFragment
                    }
                }
            `,
            variables: { oids }
         })
         // logD('objectList=', objectList)
         logD(f, `complete: ${Math.floor(performance.now() - t1)}/${Math.floor(performance.now() - t2)} msec`, oids.length)
         return objectList
      }
      try {
         return await apiCall(f, cb)
      } catch (err) {
         logD('err on objectList', err)
         throw err
      }
   }

   static async objectFull (oid) {
      const f = ObjectApi.objectFull
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { objectFull } } = await apollo.clients.api.query({
            query: gql`
                ${fragments.objectFullFragment}
                query objectFull ($oid: OID!) {
                    objectFull(oid: $oid) {
                        ... objectFullFragment
                    }
                }
            `,
            variables: { oid }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return objectFull
      }
      return await apiCall(f, cb)
   }

   static async update (oid, path, newValue) {
      const f = ObjectApi.update
      logD(f, 'start', oid)
      console.log('update.newValue')
      if (!oid) return //  TODO пытается обновить profile без пользователя (когда не вошли)
      const t1 = performance.now()
      const cb = async () => {
         let objFull = await rxdb.get(RxCollectionEnum.OBJ, oid)
         let rev = objFull.rev
         // if (path.startsWith('settings.')) rev = objFull.settings.rev
         assert(objFull, '!objFull')
         let file
         let apolloClient = apollo.clients.api
         if (newValue instanceof File) {
            file = newValue
            newValue = null
            apolloClient = apollo.clients.upload
         }
         logD(f, 'start', oid, path, newValue, file)
         let { data: { objectChange } } = await apolloClient.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation objectChange ($oid: OID!, $path: String!, $newValue: RawJSON, $file: Upload, $rev: Int!) {
                    objectChange (oid: $oid, path: $path, newValue: $newValue, file: $file, rev: $rev){
                        ...objectFullFragment
                    }
                }
            `,
            variables: { oid, path, newValue, file, rev }
         })
         await rxdb.set(RxCollectionEnum.OBJ, objectChange, { actualAge: 'day' })
         return objectChange
      }
      return await apiCall(f, cb)
   }

   static async courseUpdate (course) {
      const f = ObjectApi.courseUpdate
      logD(f, 'start', course)
      const t1 = performance.now()
      const cb = async () => {
         let courseInput = ObjectCreateApi.makeCourseInput(course)
         console.log('courseInput', courseInput)
         let { data: { blockUpdate: updatedCourse } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.blockFragment}
                mutation blockUpdate($block:  BlockInput!) {
                    blockUpdate (block: $block){
                        ...blockFragment
                    }
                }
            `,
            variables: {
               course: courseInput
            }
         })
         let reactiveCourse = await rxdb.set(RxCollectionEnum.OBJ, updatedCourse, { actualAge: 'day' })
         return reactiveCourse
      }
      let reactiveCourse = await apiCall(f, cb)
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      assert(store, '!store')
      return reactiveCourse
   }

   static async unPublish (oid) {
      const f = ObjectApi.unPublish
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert(oid)
         let { data: { unPublish: deletedObject } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation unPublish($oid: OID!) {
                    unPublish (oid: $oid){
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               oid: oid
            }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return deletedObject
      }
      let deletedObject = await apiCall(f, cb)
      await rxdb.lists.addRemoveObjectToLists('OBJECT_DELETED', deletedObject.relatedSphereOids, deletedObject)
      await rxdb.set(RxCollectionEnum.WS_NODE, ObjectCreateApi.makeWsEssence(deletedObject)) // сохраним в черновиках
   }

   static async stat (oid) {
      const f = ObjectApi.stat
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert(oid, '!oid')
         let { data: { objectStat } } = await apollo.clients.api.query({
            query: gql` ${fragments.objectShortStatFragment}
            ${fragments.objectShortFragment}
            query objectStat ($oid: OID!) {
                objectStat (oid: $oid){
                    votes{...objectShortStatFragment}
                    views{...objectShortStatFragment}
                    joints{...objectShortStatFragment}
                    bookmarks{...objectShortStatFragment}
                    shares{...objectShortStatFragment}
                    remakes{...objectShortStatFragment}
                }
            }
            `,
            variables: {
               oid: oid
            }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return objectStat
      }
      return await apiCall(f, cb)
   }

   // общая оценка ядра придет с эвентом
   static async vote (oid, rate) {
      const f = ObjectApi.vote
      logD(f, 'start', rate)
      const t1 = performance.now()
      const cb = async () => {
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
         let node = await rxdb.get(RxCollectionEnum.OBJ, oid)
         if (node) {
            // logD(f, `try change rateUser for ${node.id}`, node)
            node.rateUser = rate // node реактивен!
            logD(f, `done rateUser=${node.rateUser}`)
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return rate
      }
      return await apiCall(f, cb)
   }

   static async unvote (oid) {
      const f = ObjectApi.unvote
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         if (!oid) return
         let { data: { nodeUnrate } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation unrate ($oid: OID!) {
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
      return await apiCall(f, cb)
   }

   static async updateStat (oid, key, valueInt) {
      assert(oid, '!oid')
      assert(key in StatKeyEnum, '!key in StatKeyEnum')
      assert(typeof valueInt === 'number')
      statAccumulator.push({ oid, key, valueInt })
      updateStatThrottled()
      return true
   }

   static async commentCreate (oid, text) {
      assert(oid, '!oid')
      const f = ObjectApi.commentCreate
      logD(f, 'start', oid, text)
      const t1 = performance.now()
      const cb = async () => {
         let { data: { commentCreate } } = await apollo.clients.api.mutate({
            mutation: gql`
                ${fragments.commentFragment}
                mutation commentCreate ($oid: OID!, $text: String!) {
                    commentCreate (oid: $oid, text: $text){
                        ...commentFragment
                    }
                }
            `,
            variables: {
               oid: oid,
               text: text
            }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return commentCreate
      }
      let DummyComment = {
         id: Date.now(),
         createdAt: Date.now(),
         author: {
            oid: rxdb.getCurrentUser().oid,
            type: rxdb.getCurrentUser().type,
            name: rxdb.getCurrentUser().name,
            thumbUrl: rxdb.getCurrentUser().thumbUrl,
         },
         text
      }
      await rxdb.lists.addRemoveCommentToObj('COMMENT_CREATED', oid, DummyComment)
      try {
         let comment = await apiCall(f, cb)
         DummyComment.id = comment.id
         return comment
      } finally {
      }
   }

   static async commentDelete (oid, deletedComment) {
      assert(oid && deletedComment, '!oid')
      const f = ObjectApi.commentDelete
      logD(f, 'start', oid, deletedComment)
      const t1 = performance.now()
      const cb = async () => {
         let { data: { commentDelete } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation commentDelete ($oid: OID!, $idComment: String!) {
                    commentDelete (oid: $oid, idComment: $idComment)
                }
            `,
            variables: {
               oid: oid,
               idComment: deletedComment.id
            }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return commentDelete
      }
      await rxdb.lists.addRemoveCommentToObj('COMMENT_DELETED', oid, deletedComment)
      try {
         let boolRes = await apiCall(f, cb)
         return boolRes
      } catch (err) {
      }
   }
}

export { ObjectApi }
