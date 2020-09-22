import { apollo } from 'src/boot/apollo'
import { rxdb, RxModuleEnum } from 'src/system/rxdb'
import { systemReset } from 'src/system/services'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

class WorkspaceApi {
   // очистить мастерскую на сервере
   static async wsClear () {
      const f = this.wsClear
      logD(f, 'start')
      const t1 = performance.now()
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

   static async getWs () {
      const f = this.getWs
      logD(f, 'start')
      const t1 = performance.now()
      let { data: { ws } } = await apollo.clients.api.query({
         query: gql`query{ws}`
      })
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return ws
   }

   static async wsItemUpsert (item, wsRevision, wsVersion) {
      const f = this.wsItemUpsert
      logD(f, 'start')
      const t1 = performance.now()
      let { data: { wsItem, wsRevision: wsRevisionServer } } = await apollo.clients.api.mutate({
         mutation: gql`mutation wsItemUpsert($item: RawJSON!, $wsRevision: Int!, $wsVersion: String!) {
             wsItemUpsert (item: $item, wsRevision: $wsRevision, wsVersion: $wsVersion)
         }`,
         variables: { item, wsRevision, wsVersion }
      })
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
      return { wsItem, wsRevisionServer }
   }

   static async wsItemDelete (item, wsRevision, wsVersion) {
      const f = this.wsItemDelete
      logD(f, 'start')
      const t1 = performance.now()
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
}

export { WorkspaceApi }
