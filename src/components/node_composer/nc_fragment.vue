<style lang="stylus">
</style>
<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: 100, minHeight: '150px', borderRadius: '10px', overflow: 'hidden'
  }`
  ).row.full-width
  div(v-if="stage === 0").row.fit.items-center.justify-center.bg-grey-1
    q-btn(round outline color="accent" icon="add" @click="stage = 1")
  div(v-if="stage === 1").row.fit.items-end.justify-center.bg-grey-1
    div.row.full-width.q-pa-sm
      div(:style=`{position: 'relative', zIndex: 1000, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
        input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}`)
        q-input(
          ref="urlInput"
          v-model="url"
          @paste="urlPasted"
          :placeholder="$t('Paste URL or upload a file')"
          :input-style=`{paddingLeft: '10px', paddingRight: '10px'}`).full-width
          template(v-slot:append)
            q-btn(v-if="url.length > 0" round flat icon="clear" @click="url = ''")
            q-btn(v-else round flat icon="attachment" @click="$refs.fileInput.click()").rotate-90
  div(v-if="stage === 2 && content").row.full-width
    nc-fragment-youtube(
      v-if="content.contentSource === 'YOUTUBE'"
      :width="width"
      :content="content")
</template>

<script>
import {fragments} from 'schema/fragments'
import ncFragmentYoutube from './nc_fragment_youtube'

export default {
  name: 'ncFragment',
  components: {ncFragmentYoutube},
  props: ['width', 'stageInitial'],
  data () {
    return {
      stage: 0,
      content: null,
      file: null,
      url: ''
    }
  },
  watch: {
    url: {
      handler (to, from) {
        this.$log('WATCH url CHANGED', to)
        this.urlChanged(to)
      }
    }
  },
  methods: {
    async urlPasted (url) {
      this.$log('urlPasted', url)
      await this.$wait(200)
      this.$refs.urlInput.blur()
      // this.urlChanged(url)
    },
    async urlChanged (to) {
      this.$log('url CHANGED', to)
      try {
        let url = new URL(to)
        this.$log('url GOOD', url)
        let {data: {uploadContentUrl}} = await this.$apollo.mutate({
          mutation: gql`
            ${fragments.objectFragment}
            mutation nc_uploadContentUrl ($url: String!) {
              uploadContentUrl (url: $url, onlyMeta: true) {
                ...objectFragment
              }
            }
          `,
          variables: {
            url: to
          }
        })
        this.$log('uploadContentUrl', uploadContentUrl)
        this.content = uploadContentUrl
        // this.content = await this.$store.dispatch('objects/get', { oid: uploadContentUrl.oid, fragmentName: 'objectFragment', priority: 0 })
        // FAKE YOUTUBE
        // this.content.contentSource = 'YOUTUBE'
        // let regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
        // let match = url.href.match(regExp)
        // if (match && match[1] && match[1].length === 11) {
        //   this.content.urlOriginal = `https://www.youtube.com/embed/${match[1]}`
        // }
        this.$log('content', this.content)
        this.stage = 2
      } catch (e) {
        this.$log('url WRONG', to)
      }
    },
    fileChanged (e) {
      this.$log('fileChanged', e)
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.stageInitial) this.stage = this.stageInitial
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
