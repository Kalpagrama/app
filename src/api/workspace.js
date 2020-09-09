import { apollo } from 'src/boot/apollo'
import { rxdb, RxModuleEnum } from 'src/system/rxdb'
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
    await rxdb.eraseWs()
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

  static async wsItemUpsert (item, wsRevision) {
    const f = this.wsItemUpsert
    logD(f, 'start')
    const t1 = performance.now()
    let { data: { wsItemUpsert } } = await apollo.clients.api.mutate({
      mutation: gql`mutation wsItemUpsert($item: RawJSON!, $wsRevision: Int!) {
        wsItemUpsert (item: $item, wsRevision: $wsRevision)
      }`,
      variables: { item, wsRevision }
    })
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
    return wsItemUpsert
  }

  static async wsItemDelete (item, wsRevision) {
    const f = this.wsItemDelete
    logD(f, 'start')
    const t1 = performance.now()
    let { data: { wsItemUpsert, wsItemDelete } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation wsItemDelete($item: RawJSON!, $wsRevision: Int!) {
          wsItemDelete (item: $item, wsRevision: $wsRevision)
        }`,
      variables: { item, wsRevision }
    })
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
    return wsItemUpsert
  }
}

export { WorkspaceApi }
