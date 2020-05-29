import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.GQL)

class ContentApi {
  static async contentCreateFromUrl (context, url) {
    logD('contentCreateFromUrl start')
    assert.ok(url)
    let { data: { contentCreateFromUrl } } = await apollo.clients.upload.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation ($url: String!) {
          contentCreateFromUrl (url: $url) {
            ...objectFullFragment
          }
        }
      `,
      variables: {
        url
      }
    })
    logD('contentCreateFromUrl complete', contentCreateFromUrl)
    return contentCreateFromUrl
  }

  static async contentCreateFromFile (context, file) {
    logD('contentCreateFromFile start')
    assert.ok(file)
    let { data: { contentCreateFromFile } } = await apollo.clients.upload.mutate({
      mutation: gql`
        ${fragments.objectFullFragment}
        mutation ($file: Upload!, $length: Float!) {
          contentCreateFromFile(file: $file, length: $length) {
            ...objectFullFragment
          }
        }
      `,
      variables: {
        file: file,
        length: file.size
      }
    })
    logD('contentCreateFromFile complete')
    return contentCreateFromFile
  }
}

export { ContentApi }
