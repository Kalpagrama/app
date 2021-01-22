<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px !important
</style>

<template lang="pug">
.row.full-width
  q-dialog(
    v-model="contentImporterShow"
    position="bottom"
    maximized
    @hide="loading = false, searchString = ''")
    content-importer(
      :contentFile="contentFile"
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      @contentKalpa="contentKalpaFound"
      @close="contentImporterShow = false")
  //- q-btn(
    round flat color="white" icon="construction"
    :style=`{
      width: '58px',
    }`)
  .col
    q-input(
      v-model="searchString"
      outlined
      color="green"
      placeholder="Поиск или URL"
      :dark="focused"
      :loading="loading"
      :debounce="500"
      :input-style=`{
        borderRadius: '10px',
        color: 'white'
      }`
      :style=`{
        borderRadius: '10px',
        color: 'white'
      }`
      @focus="focused = true"
      @blur="focused = false"
      ).full-width.text-white.b-40
      template(v-slot:append)
        q-btn(
          v-if="searchString.length > 0 && !loading"
          round flat dense color="grey-8" icon="clear" @click="searchString = ''")
  //- content-uploader(
    v-if="true"
    @file="contentFile = $event, contentImporterShow = true")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { UserApi } from 'src/api/user'

import contentUploader from './content_uploader.vue'

export default {
  name: 'wsSearch',
  props: {
    feedId: {type: String},
  },
  components: {
    contentUploader,
    contentImporter: () => import('./content_importer/index.vue')
  },
  data () {
    return {
      loading: false,
      searchString: '',
      focused: false,
      // contentKalpa: null,
      contentFile: null,
      contentImporterShow: false,
    }
  },
  watch: {
    searchString: {
      async handler (to, from) {
        if (this.isURL(to)) {
          this.loading = true
          this.contentKalpaFound(await ContentApi.contentCreateFromUrl(to))
          this.loading = false
        }
        else {
          this.$emit('searchString', to)
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
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // check bookmark...
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) await bookmark.restoreFromTrash() // на тот случай если он сейчас в корзине
      this.$emit('contentKalpa', contentKalpa)
      // this.$router.push(`/content/${this.contentKalpa.oid}`)
      // this.$router.push(`/content/${item.oid}/?viewid=nodes&pick=node&id=${this.$route.params.id}`)
    }
  },
}
</script>
