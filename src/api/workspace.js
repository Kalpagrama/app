import { apollo } from 'src/boot/apollo'
import gql from 'graphql-tag'
import { rxdb, RxModuleEnum } from 'src/system/rxdb'
import { systemInit, systemReset } from 'src/system/services'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { apiCall } from 'src/api/index'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.API)

class WorkspaceApi {
   // очистить мастерскую на сервере
   static async wsClear () {
      const f = WorkspaceApi.wsClear
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { wsClear } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation wsClear {
                    wsClear
                }
            `
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return wsClear
      }
      let res = await apiCall(f, cb)
      await systemReset(false, true, false, true)
      return res
   }

   static async getWs () {
      const f = WorkspaceApi.getWs
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { ws } } = await apollo.clients.api.query({
            query: gql`query{ws}`
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return ws
      }
      return await apiCall(f, cb)
   }

   // static async wsItemUpsert (item, wsRevision, wsVersion) {
   //    const f = WorkspaceApi.wsItemUpsert
   //    logD(f, 'start')
   //    const t1 = performance.now()
   //    const cb = async () => {
   //       let { data: { wsItem, wsRevision: wsRevisionServer } } = await apollo.clients.api.mutate({
   //          mutation: gql`mutation wsItemUpsert($item: RawJSON!, $wsRevision: Int!, $wsVersion: String!) {
   //              wsItemUpsert (item: $item, wsRevision: $wsRevision, wsVersion: $wsVersion)
   //          }`,
   //          variables: { item, wsRevision, wsVersion }
   //       })
   //       logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   //       return { wsItem, wsRevisionServer }
   //    }
   //    return await apiCall(f, cb)
   // }
   //
   // static async wsItemDelete (item, wsRevision, wsVersion) {
   //    const f = WorkspaceApi.wsItemDelete
   //    logD(f, 'start', item)
   //    const t1 = performance.now()
   //    const cb = async () => {
   //       let { data: { wsItem, wsRevision: wsRevisionServer } } = await apollo.clients.api.mutate({
   //          mutation: gql`
   //              mutation wsItemDelete($item: RawJSON!, $wsRevision: Int!, $wsVersion: String!) {
   //                  wsItemDelete (item: $item, wsRevision: $wsRevision, wsVersion: $wsVersion)
   //              }`,
   //          variables: { item, wsRevision, wsVersion }
   //       })
   //       logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
   //       return { wsItem, wsRevisionServer }
   //    }
   //    return await apiCall(f, cb)
   // }

   static async wsBatchOperation (operations, wsRevision, wsVersion) {
      const f = WorkspaceApi.wsBatchOperation
      logD(f, 'start', operations)
      const t1 = performance.now()
      const cb = async () => {
         let { data: { wsBatchOperation } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation wsBatchOperation($operations: [RawJSON!]!, $wsRevision: Int!, $wsVersion: String!) {
                    wsBatchOperation (operations: $operations, wsRevision: $wsRevision, wsVersion: $wsVersion)
                }`,
            variables: { operations, wsRevision, wsVersion }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return wsBatchOperation
      }
      return await apiCall(f, cb)
   }
}

export { WorkspaceApi }
