import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import { apollo } from 'src/boot/apollo'
import {assert} from 'src/system/common/utils'
import { fragments } from 'src/api/fragments'
import { apiCall } from 'src/api/index'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import gql from 'graphql-tag'

let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.API)

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
   GIF: 'gif',
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
   static async contentCreateFromUrl (url, extractProviderContent = false) {
      const f = ContentApi.contentCreateFromUrl
      logD(f, 'start', url)
      const t1 = performance.now()
      const cb = async () => {
         assert(url)
         let { data: { contentCreateFromUrl } } = await apollo.clients.upload.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation ($url: String!, $extractProviderContent: Boolean!) {
                    contentCreateFromUrl (url: $url, extractProviderContent: $extractProviderContent) {
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               url,
               extractProviderContent
            }
         })
         logD('contentCreateFromUrl complete', contentCreateFromUrl)
         return contentCreateFromUrl
      }
      return await apiCall(f, cb)
   }

   static async contentCreateFromFile (file, name, description, spheres) {
      const f = ContentApi.contentCreateFromFile
      logD(f, 'start', file, name, description)
      name = name || ''
      description = description || ''
      spheres = spheres || []
      const t1 = performance.now()
      const cb = async () => {
         assert(file)
         // file.lastModifiedDate = file.lastModifiedDate || new Date()
         // file.name = file.name || '*empty*'
         // if (file.size > 5 * 1024 * 1024){
         //   throw new Error('client_max_body_size 5M')
         // }
         let { data: { contentCreateFromFile } } = await apollo.clients.upload.mutate({
            mutation: gql`
                ${fragments.objectFullFragment}
                mutation ($file: Upload!, $size: Float!, $name: String!, $description: String!, $spheres: [ObjectShortInput!]!) {
                    contentCreateFromFile(file: $file, size: $size, name: $name, description: $description, spheres: $spheres) {
                        ...objectFullFragment
                    }
                }
            `,
            variables: {
               file: file,
               size: file.size,
               name,
               spheres,
               description,
            }
         })
         logD('contentCreateFromFile complete', contentCreateFromFile.oid)
         let reactiveContent = await rxdb.set(RxCollectionEnum.OBJ, contentCreateFromFile, { actualAge: 'day' })
         return contentCreateFromFile
      }
      return await apiCall(f, cb, false) // это долгий запрос
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
   // eslint-disable-next-line camelcase
   static urlSelect_internal (urlWithFormats) {
      // todo опираться на реальную скорость инета (можно расчитать в сервисворкере)
      const f = ContentApi.urlSelect
      logD(f, 'start', urlWithFormats)
      assert(urlWithFormats, 'urlWithFormats is null!!')
      if (!urlWithFormats || !urlWithFormats.length) return null
      let urls = urlWithFormats.reduce((acc, val) => {
         acc[val.format] = val.url
         return acc
      }, {})
      if (urls[ImageUploadFormatEnum.GIF]) return urls[ImageUploadFormatEnum.GIF]
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

   static urlSelect (object) {
      let url = object.url
      if (!url && object.urlWithFormats) url = ContentApi.urlSelect_internal(object.urlWithFormats)
      if (!url && object.previewUrlWithFormats) url = ContentApi.urlSelect_internal(object.previewUrlWithFormats)
      if (!url) url = object.urlRaw
      if (!url) url = object.urlOriginal
      if (!url) url = object.thumbUrl
      logT('urlSelect url=', url)
      return url
   }
}

export { ContentApi }
