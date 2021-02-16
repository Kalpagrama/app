import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { apiCall } from 'src/api/index'
import { rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

class ContentApi {
   static async contentCreateFromUrl (url, youtubeUpload = false) {
      const f = ContentApi.contentCreateFromUrl
      logD(f, 'start', url)
      const t1 = performance.now()
      const cb = async () => {
         assert.ok(url)
         let { data: { contentCreateFromUrl } } = await apollo.clients.upload.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation ($url: String!, $youtubeUpload: Boolean!) {
                    contentCreateFromUrl (url: $url, youtubeUpload: $youtubeUpload) {
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               url,
               youtubeUpload
            }
         })
         logD('contentCreateFromUrl complete', contentCreateFromUrl)
         return contentCreateFromUrl
      }
      return await apiCall(f, cb)
   }

   static async contentCreateFromFile (file) {
      const f = ContentApi.contentCreateFromFile
      logD(f, 'start', file)
      const t1 = performance.now()
      const cb = async () => {
         assert.ok(file)
         // file.lastModifiedDate = file.lastModifiedDate || new Date()
         // file.name = file.name || '*empty*'
         // if (file.size > 5 * 1024 * 1024){
         //   throw new Error('client_max_body_size 5M')
         // }
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
      return await apiCall(f, cb)
   }

   static async contentCutCreate (contentOid, epubCfi, epubCfiText, params) {
      const f = ContentApi.contentCutCreate
      logD(f, 'start', contentOid, epubCfi, epubCfiText)
      const cb = async () => {
         assert(contentOid && epubCfi && epubCfiText, 'bad params')
         let { data: { contentCutCreate } } = await apollo.clients.upload.mutate({
            mutation: gql` ${fragments.contentCutFragment}
                mutation ($contentOid: OID!, $epubCfi: String!, $epubCfiText: String!, $params: RawJSON) {
                    contentCutCreate(contentOid: $contentOid, epubCfi: $epubCfi, epubCfiText: $epubCfiText, params: $params) {
                       ... contentCutFragment
                    }
                }
            `,
            variables: { contentOid, epubCfi, epubCfiText, params }
         })
         await rxdb.lists.addCutToContent(contentOid, contentCutCreate)
         logD('contentCutCreate complete')
         return contentCutCreate
      }
      return await apiCall(f, cb)
   }
}

export { ContentApi }
