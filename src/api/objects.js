import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class ObjectsApi {
  static async objectList (oids) {
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
    return objectList
  }

  static async objectFull (oid) {
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
    return objectFull
  }

  static async update(oid, path, newValue, rev){
    let { data: { objectChange } } = await apollo.clients.api.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation objectChange ($oid: OID!, $path: String!, $newValue: RawJSON!, $revision: Int!) {
          objectChange (oid: $oid, path: $path, newValue: $newValue, rev: $revision){
            ...objectFullFragment
          }
        }
      `,
      variables: { oid, path, newValue, rev}
    })
    return objectChange
  }
}

export { ObjectsApi }
