import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'
import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
}

export const contentCreateFromUrl = async (context, url) => {
  logD('contentCreateFromUrl start')
  assert.ok(url)
  let {data: {contentCreateFromUrl}} = await apollo.clients.upload.mutate({
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
export const contentCreateFromFile = async (context, file) => {
  logD('contentCreateFromFile start')
  assert.ok(file)
  let {data: {contentCreateFromFile}} = await apollo.clients.upload.mutate({
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
