import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.GQL)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.GQL)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.GQL)

class ContentApi {
  static async contentCreateFromUrl (url) {
    logD('contentCreateFromUrl start', url)
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

  static async contentCreateFromFile (file) {
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
