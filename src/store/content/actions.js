import { getLogFunc, LogLevelEnum, LogModulesEnum } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/schema/fragments'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogModulesEnum.VUEX_WS)
const logE = getLogFunc(LogLevelEnum.ERROR, LogModulesEnum.VUEX_WS)
const logW = getLogFunc(LogLevelEnum.WARNING, LogModulesEnum.VUEX_WS)

export const init = async (context) => {
  if (context.state.initialized) return
  context.commit('init')
}

export const uploadContentUrl = async (context, url) => {
  logD('uploadContentUrl start')
  assert.ok(url)
  let {data: {uploadContentUrl}} = await apollo.clients.upload.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation sw_network_only_nc_contentGetByUrl ($url: String!, $onlyMeta: Boolean!) {
        uploadContentUrl (url: $url, onlyMeta: $onlyMeta) {
          ...objectFullFragment
        }
      }
    `,
    variables: {
      url: url,
      onlyMeta: true
    }
  })
  logD('uploadContentUrl complete')
  return uploadContentUrl
}
export const uploadContentFile = async (context, file) => {
  logD('uploadContentFile start')
  assert.ok(file)
  let {data: {uploadContentFile}} = await apollo.clients.upload.mutate({
    mutation: gql`
      ${fragments.objectFullFragment}
      mutation sw_network_only_nc_contentGetByFile ($file: Upload!, $length: Float!) {
        uploadContentFile(file: $file, length: $length) {
          ...objectFullFragment
        }
      }
    `,
    variables: {
      file: file,
      length: file.size
    }
  })
  logD('uploadContentFile complete')
  return uploadContentFile
}
