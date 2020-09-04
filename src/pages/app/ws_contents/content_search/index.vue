<template lang="pug">
.row.full-width.q-px-sm
  q-dialog(
    v-model="contentImporterShow"
    :maximized="$q.screen.width < 800"
    @hide="contentKalpa = null, contentFile = null")
    content-importer(
      :contentKalpa="contentKalpa"
      :contentFile="contentFile"
      @contentKalpa="contentKalpaSelected"
      @close="contentImporterShow = false")
  div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).col
    q-input(
      v-model="searchStringRaw"
      ref="searchStringInput"
      filled dense dark color="white"
      :placeholder="$t('find_content_or_paste_url', 'Найди контент или вставь ссылку')"
      :loading="searchStringLoading"
      @focus="searchStringFocused"
      @blur="searchStringBlurred"
      :input-style=`{
        paddingRight: '0px',
      }`
      :style=`{
        margin: 0,
        //- paddingRight: '0px',
      }`
      ).full-width
      template(v-slot:append)
        q-btn(
          v-if="searchStringRaw.length > 0"
          @click="searchStringRaw = ''"
          flat dense color="white" icon="clear")
        q-btn(
          flat dense color="white" icon="tune")
  content-uploader(@file="contentFile = $event, contentImporterShow = true")
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentUploader from './content_uploader/index.vue'
import contentImporter from 'components/content_importer/index.vue'

export default {
  name: 'wsContentList_contentSearch',
  components: {contentUploader, contentImporter},
  data () {
    return {
      searchString: '',
      searchStringRaw: '',
      searchStringLoading: false,
      searchStringIsURL: false,
      contentFile: null,
      contentKalpa: null,
      contentImporterShow: false,
    }
  },
  watch: {
    searchStringRaw: {
      async handler (to, from) {
        this.$log('searchString CHANGED', to)
        if (this.isURL(to)) {
          this.searchStringLoading = true
          this.contentKalpa = await this.contentFromURL(to)
          this.contentImporterShow = true
        }
        else {
          this.searchString = to
        }
      }
    },
    searchString: {
      handler (to, from) {
        this.$log('searchString TO', to)
        this.$emit('searchString', to)
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
    async contentFromURL (url) {
      try {
        this.$log('contentFromURL start', url)
        let content = await ContentApi.contentCreateFromUrl(url)
        this.$log('contentFromURL done', content)
        return content
      } catch (e) {
        this.$log('contentFromURL error', e)
      }
    },
    async contentKalpaSelected (contentKalpa) {
      this.$log('contentKalpaSelected', contentKalpa)
      this.contentImporterShow = false
      // show loading progress
      // contentAdd to workspace...
      let contentWorkspace = await this.contentAdd(contentKalpa)
      this.$emit('content', contentWorkspace)
    },
    async contentAdd (content) {
      this.$log('contentAdd content', content)
      // todo неверное решение! мастерская автономна! oid появится только после синхронизации!!!!
      let {items: contentFind} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          contentOid: content.oid
        }
      })
      this.$log('contentAdd contentFind', contentFind)
      // create rxDoc
      if (contentFind.length === 0) {
        let contentInput = {
          wsItemType: 'WS_CONTENT',
          thumbOid: content.thumbUrl,
          name: content.name,
          layers: [],
          spheres: [],
          contentOid: content.oid,
          contentType: content.type,
          operation: {
            items: null,
            operations: null,
            type: 'CONCAT'
          }
        }
        this.$log('contentAdd contentInput', contentInput)
        let res = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, contentInput)
        this.$log('contentAdd res', res)
        return res
      } else {
        return contentFind[0]
      }
    },
    searchStringFocused () {
      this.$log('searchStringFocused')
      navigator.permissions.query({name: 'clipboard-read'}).then(async (result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          let text = await navigator.clipboard.readText()
          this.$log('text', text)
          if (this.isURL(text)) {
            this.searchStringRaw = text
          }
        }
      })
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
    },
  },
}
</script>
