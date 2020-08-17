<template lang="pug">
.row.full-width.q-px-sm
  .col.q-pr-xs
    q-input(
      v-model="searchStringRaw"
      ref="searchStringInput"
      filled dense dark color="white"
      :placeholder="$t('find_content_or_paste_url', 'Найди контент или вставь ссылку')"
      :loading="searchStringLoading"
      @focus="searchStringFocused"
      @blur="searchStringBlurred"
      ).full-width
      template(v-slot:append)
        q-btn(
          v-if="searchStringRaw.length > 0"
          @click="searchStringRaw = ''"
          flat dense color="white" icon="clear")
        q-btn(
          flat dense color="white" icon="filter_list")
  content-uploader(@content="contentUploaded")
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentUploader from './content_uploader/index.vue'

export default {
  name: 'wsContentList_contentSearch',
  components: {contentUploader},
  data () {
    return {
      searchString: '',
      searchStringRaw: '',
      searchStringLoading: false,
      contentFile: null,
    }
  },
  watch: {
    searchStringRaw: {
      async handler (to, from) {
        this.$log('searchString CHANGED', to)
        if (this.isURL(to)) {
          this.searchStringLoading = true
          this.$q.loading.show({spinnerColor: 'green', message: 'Loading content...'})
          this.searchStringRaw = ''
          this.$refs.searchStringInput.blur()
          await this.$wait(2000)
          this.$q.loading.hide()
          this.searchStringLoading = false
          this.contentPicked(await this.contentAdd(await this.contentFromURL(to)))
        }
        else {
          this.searchString = to
        }
      }
    }
  },
  methods: {
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
    contentUploaded (content) {
      this.$log('contentUploaded', content)
    },
    async contentFromURL (url) {
      try {
        this.$log('contentFromURL start', url)
        let content = await ContentApi.contentCreateFromUrl(url)
        this.$log('contentFromURL done')
        return content
      } catch (e) {
        this.$log('contentFromURL error', e)
      }
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
      // this.$store.commit('ui/stateSet', ['wsShowMenu', false])
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
      // this.$store.commit('ui/stateSet', ['wsShowMenu', true])
    },
  },
}
</script>
