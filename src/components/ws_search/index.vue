<style lang="sass">
.q-field--outlined .q-field__control
  border-radius: 10px !important
</style>

<template lang="pug">
.row.full-width
  q-dialog(
    v-model="showContentDialog"
    :maximized="true"
    @hide="loading = false, searchString = ''"
    )
    content-importer(
      :contentKalpa="contentKalpa"
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
      }`
      @close="showContentDialog = false")
  q-input(
    v-model="searchString"
    outlined
    color="green"
    placeholder="Поиск или URL"
    :dark="focused"
    :loading="loading"
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
      q-btn(
        v-if="searchString.length === 0 && !loading"
        @click="uploadStart()"
        round flat dense color="grey-8" icon="get_app")
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'wsSearch',
  components: {
    contentImporter: () => import('./content_importer.vue')
  },
  data () {
    return {
      searchString: '',
      focused: false,
      contentKalpa: null,
      loading: false,
      showContentDialog: false,
    }
  },
  watch: {
    searchString: {
      async handler (to, from) {
        if (this.isURL(to)) {
          this.loading = true
          // this.searchString = ''
          this.contentKalpa = await ContentApi.contentCreateFromUrl(to)
          this.$log('contentKalpa', this.contentKalpa)
          // this.showContentDialog = true
          // this.$emit('content', this.contentKalpa)
          this.$router.push(`/content/${this.contentKalpa.oid}`)
          // add to workspace as bookmark...
        }
        else {
          this.$emit('searchString', to)
        }
      }
    }
  },
  methods: {
    uploadStart () {
      this.$log('uploadStart')
      // showUploadDialog...
      // showContentDialog...
    },
    isURL (str) {
      let a = document.createElement('a')
      a.href = str
      return (a.host && a.host !== window.location.host)
    },
  },
}
</script>
