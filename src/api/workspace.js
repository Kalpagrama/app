import { apollo } from 'src/boot/apollo'
import { rxdb, RxModuleEnum } from 'src/system/rxdb'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class WorkspaceApi {
  // очистить мастерскую на сервере
  static async wsClear () {
    let f = this.wsClear
    logD(f, 'start')
    let { data: { wsClear } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation wsClear {
          wsClear
        }
      `
    })
    await rxdb.clearModule(RxModuleEnum.WS)
    logD(f, 'done', wsClear)
    return wsClear
  }

  static async getWs () {
    let f = this.getWs
    logD(f, 'start')
    let { data: { ws } } = await apollo.clients.api.query({
      query: gql`query{ws}`
    })
    logD(f, 'complete')
    return ws
  }

  static async wsItemUpsert (item) {
    let f = this.wsItemUpsert
    logD(f, 'start')
    let { data: { wsItemUpsert } } = await apollo.clients.api.mutate({
      mutation: gql`mutation wsItemUpsert($item: RawJSON!) {
        wsItemUpsert (item: $item)
      }`,
      variables: { item }
    })
    logD(f, 'complete')
    return wsItemUpsert
  }

  static async wsItemDelete (item) {
    let f = this.wsItemDelete
    logD(f, 'start')
    let { data: { wsItemUpsert, wsItemDelete } } = await apollo.clients.api.mutate({
      mutation: gql`
        mutation wsItemDelete($item: RawJSON!) {
          wsItemDelete (item: $item)
        }`,
      variables: { item }
    })
    logD(f, 'complete')
    return wsItemUpsert
  }
}

export { WorkspaceApi }
