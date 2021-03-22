import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance, localStorage } from 'src/system/log'
import { apollo } from 'src/boot/apollo'
import assert from 'assert'
import { fragments } from 'src/api/fragments'
import { apiCall } from 'src/api/index'
import { rxdb } from 'src/system/rxdb'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.API)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.API)
const logW = getLogFunc(LogLevelEnum.WARNING, LogSystemModulesEnum.API)

const BookUploadFormatEnum = Object.freeze({
   EPUB: 'epub'
})
const VideoUploadFormatEnum = Object.freeze({
   SD144: '144p',
   SD240: '240p',
   SD360: '360p',
   SD480: '480p',
   HD720: '720p',
   HD1080: '1080p'
})
const ImageUploadFormatEnum = Object.freeze({
   W50: '50',
   W600: '600',
   W1024: '1024',
   W1920: '1920',
   SNIPPET: 'snippet',
   VK: 'vkSnippet',
   TW: 'twSnippet',
   FB: 'fbSnippet',
   TG: 'tgSnippet'
})
const UploadFormatEnum = Object.freeze({
   DEFAULT: 'default',
   ...BookUploadFormatEnum,
   ...VideoUploadFormatEnum,
   ...ImageUploadFormatEnum

})

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

   // выберет подходящий формат в зависимости от скорости сети
   static urlSelect (urlWithFormats) {
      // todo опираться на реальную скорость инета (можно расчитать в сервисворкере)
      const f = ContentApi.urlSelect
      logD(f, 'start', urlWithFormats)
      assert(urlWithFormats, 'urlWithFormats is null!!')
      if (!urlWithFormats || !urlWithFormats.length) return null
      let urls = urlWithFormats.reduce((acc, val) => {
         acc[val.format] = val.url
         return acc
      }, {})
      if (urls[VideoUploadFormatEnum.HD720]) return urls[VideoUploadFormatEnum.HD720]
      if (urls[VideoUploadFormatEnum.SD480]) return urls[VideoUploadFormatEnum.SD480]
      if (urls[VideoUploadFormatEnum.SD360]) return urls[VideoUploadFormatEnum.SD360]
      if (urls[VideoUploadFormatEnum.SD240]) return urls[VideoUploadFormatEnum.SD240]
      if (urls[VideoUploadFormatEnum.SD144]) return urls[VideoUploadFormatEnum.SD144]
      if (urls[BookUploadFormatEnum.EPUB]) return urls[BookUploadFormatEnum.EPUB]
      if (urls[ImageUploadFormatEnum.W1920]) return urls[ImageUploadFormatEnum.W1920]
      if (urls[ImageUploadFormatEnum.W1024]) return urls[ImageUploadFormatEnum.W1024]
      if (urls[ImageUploadFormatEnum.W600]) return urls[ImageUploadFormatEnum.W600]
      if (urls[ImageUploadFormatEnum.W50]) return urls[ImageUploadFormatEnum.W50]

      return urlWithFormats[0].url // вернем первый попавшийся
   }
}

export { ContentApi }
