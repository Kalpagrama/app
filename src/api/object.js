import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { rxdb, RxCollectionEnum, makeId } from 'src/system/rxdb'
import assert from 'assert'
import { ActionEnum, AuthApi } from 'src/api/auth'
import { apiCall } from 'src/api/index'
import { updateRxDocPayload } from 'src/system/rxdb/reactive'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

const StatKeyEnum = Object.freeze({
   VIEWED_TIME: 'VIEWED_TIME',
   BOOKMARKED: 'BOOKMARKED',
   SHARED: 'SHARED',
   REMADE: 'REMADE'
})

class ObjectApi {
   static fileToDataUrl (file) {
      return new Promise((resolve, reject) => {
         const reader = new FileReader()
         reader.readAsDataURL(file)
         reader.onload = () => resolve(reader.result)
         reader.onerror = error => reject(error)
      })
   }

   static async objectList (oids) {
      const f = ObjectApi.objectList
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
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
         logD('objectList=', objectList)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return objectList
      }
      return await apiCall(f, cb)
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
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let objFull = await rxdb.get(RxCollectionEnum.OBJ, oid)
         let rev = objFull.rev
         if (path.startsWith('settings.')) rev = objFull.settings.rev
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

   static async unPublish (oid) {
      const f = ObjectApi.unPublish
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert.ok(oid)
         let { data: { unPublish } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation unPublish($oid: OID!) {
                    unPublish (oid: $oid)
                }
            `,
            variables: {
               oid: oid
            }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return unPublish
      }
      return await apiCall(f, cb)
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
                    researches{...objectShortStatFragment}
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

   static async updateStat (oid, key, value) {
      const f = ObjectApi.updateStat
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         assert(oid, '!oid')
         assert(key in StatKeyEnum, '!key in StatKeyEnum')

         let { data: { updateStat } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation updateStat ($oid: OID!, $statData: StatDataInput!) {
                    updateStat (oid: $oid, statData: $statData)
                }
            `,
            variables: {
               oid: oid,
               statData: {
                  key,
                  valueInt: value
               }
            }
         })
         switch (key) {
            case StatKeyEnum.REMADE:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countRemakes', item => item.countRemakes + 1, false)
               break
            case StatKeyEnum.SHARED:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countShares', item => item.countShares + 1, false)
               break
            case StatKeyEnum.VIEWED_TIME:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countViews', item => item.countViews + 1, false)
               break
            case StatKeyEnum.BOOKMARKED:
               await updateRxDocPayload(makeId(RxCollectionEnum.OBJ, oid), 'countBookmarks', item => item.countBookmarks + 1, false)
               break
         }
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return updateStat
      }
      return await apiCall(f, cb)
   }
}

export { ObjectApi }
