<template lang="pug">
.row.full-width.q-px-sm
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
        paddingRight: '0px',
      }`
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
          this.$emit('content', await this.contentAdd(await this.contentFromURL(to)))
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
    contentUploaded (content) {
      this.$log('contentUploaded', content)
      this.contentAdd(content)
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
      this.$log('FOCUS', document.hasFocus())
      navigator.permissions.query({name: 'clipboard-read'}).then(async (result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          // navigator.clipboard.read().then(({ items }) => {
          //   items.forEach(item => {
          //     console.log(item.type)
          //     // do something with the data item
          //   })
          // })
          let text = await navigator.clipboard.readText()
          if (this.isURL(text)) {
            this.$emit('content', await this.contentAdd(await this.contentFromURL(text)))
            // this.contentFromURL(text)
          }
          this.$log('text', text)
        }
      })
    },
    searchStringBlurred () {
      this.$log('searchStringBlurred')
      // this.$store.commit('ui/stateSet', ['wsShowMenu', true])
    },
  },
}
</script>
