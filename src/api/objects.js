import { apollo } from 'src/boot/apollo'
import { fragments } from 'src/api/fragments'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { rxdb, RxCollectionEnum } from 'src/system/rxdb'
import assert from 'assert'
import { ActionEnum, AuthApi } from 'src/api/auth'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

class ObjectsApi {
  static fileToDataUrl (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  static async objectList (oids) {
    const f = ObjectsApi.objectList
    logD(f, 'start')
    const t1 = performance.now()
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

  static async objectFull (oid) {
    const f = ObjectsApi.objectFull
    logD(f, 'start')
    const t1 = performance.now()
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

  static async update (oid, path, newValue) {
    const f = ObjectsApi.update
    let objFull = await rxdb.get(RxCollectionEnum.OBJ, oid)
    let rev = objFull.rev
    if (path.startsWith('settings.')) rev = objFull.settings.rev
    assert(objFull, '!objFull')
    let file
    let apolloClient = apollo.clients.api
    if (newValue instanceof File){
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
    await rxdb.set(RxCollectionEnum.OBJ, objectChange, {actualAge: 'day'})
    return objectChange
  }

  static async getSphere (name) {
    logD('getSphere start')
    let {data: {sphere}} = await apollo.clients.api.query({
      query: gql`
        query getSphere ($name: String!) {
          sphere (name: $name) {
            oid
          }
        }
      `,
      variables: {
        name
      }
    })
    return sphere
  }

  static async votes (oid) {
    const f = this.votes
    logD(f, 'start')
    const t1 = performance.now()
    assert(oid, '!oid')
    let { data: { votes } } = await apollo.clients.api.query({
      mutation: gql`
        ${fragments.objectShortFragment}
        query votes ($oid: OID!) {
          votes (oid: $oid){
            user{...objectShortFragment}
            history{
              date
              rate
              weight
            }
          }
        }
      `,
      variables: {
        oid: oid
      }
    })
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
    return votes
  }
}

export { ObjectsApi }
