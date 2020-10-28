import { apollo } from 'src/boot/apollo'
import { rxdb, RxModuleEnum } from 'src/system/rxdb'
import { systemReset } from 'src/system/services'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apiCall } from 'src/api/index'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

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
         await systemReset(false, true, true)
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return wsClear
      }
      return await apiCall(f, cb)
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

   static async wsItemUpsert (item, wsRevision, wsVersion) {
      const f = WorkspaceApi.wsItemUpsert
      logD(f, 'start')
      const t1 = performance.now()
      const cb = async () => {
         let { data: { wsItem, wsRevision: wsRevisionServer } } = await apollo.clients.api.mutate({
            mutation: gql`mutation wsItemUpsert($item: RawJSON!, $wsRevision: Int!, $wsVersion: String!) {
                wsItemUpsert (item: $item, wsRevision: $wsRevision, wsVersion: $wsVersion)
            }`,
            variables: { item, wsRevision, wsVersion }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return { wsItem, wsRevisionServer }
      }
      return await apiCall(f, cb)
   }

   static async wsItemDelete (item, wsRevision, wsVersion) {
      const f = WorkspaceApi.wsItemDelete
      logD(f, 'start', item)
      const t1 = performance.now()
      const cb = async () => {
         let { data: { wsItem, wsRevision: wsRevisionServer } } = await apollo.clients.api.mutate({
            mutation: gql`
                mutation wsItemDelete($item: RawJSON!, $wsRevision: Int!, $wsVersion: String!) {
                    wsItemDelete (item: $item, wsRevision: $wsRevision, wsVersion: $wsVersion)
                }`,
            variables: { item, wsRevision, wsVersion }
         })
         logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
         return { wsItem, wsRevisionServer }
      }
      return await apiCall(f, cb)
   }
}

export { WorkspaceApi }
