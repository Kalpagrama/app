<template lang="pug">
.row.full-width
  q-dialog(
    v-model="contentImporterShow"
    :maximized="$q.screen.width < 800"
    @hide="contentKalpa = null, contentFile = null")
    content-importer(
      :contentKalpa="contentKalpa"
      :contentFile="contentFile"
      @contentKalpa="$emit('contentKalpa', $event), contentImporterShow = false"
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
      }`
      ).full-width
      template(v-slot:append)
        q-btn(
          v-if="searchStringRaw.length > 0"
          @click="searchStringRaw = ''"
          flat dense color="white" icon="clear")
        //- q-btn(
          flat dense color="white" icon="tune")
  content-uploader(@file="contentFile = $event, contentImporterShow = true")
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentUploader from './content_uploader/index.vue'
import contentImporter from 'components/content_importer/index.vue'

export default {
  name: 'contentSearch',
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
          this.contentKalpa = await ContentApi.contentCreateFromUrl(to)
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
