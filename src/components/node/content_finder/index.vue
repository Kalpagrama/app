<style lang="stylus">
</style>
<template lang="pug">
.row.fit.items-center.content-center.justify-center
  div(:style=`{}`).row.full-width.items-center.content-center.justify-center
    //- input file
    input(
      v-if="sources.includes('device')"
      ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}` accept="video/*, image/*")
    //- input url
    div(
      v-if="sources.includes('url')"
      :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-3
      div(
        v-if="progress"
        :style=`{position: 'absolute', zIndex: 100, left: 0, width: progress.progress+'%'}`
        ).row.full-height.bg-green
      q-input(
        v-model="url" filled
        color="green" placeholder="Paste URL to add content"
        :loading="urlInputLoading"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        :input-style=`{paddingLeft: '10px'}`
        ).full-width.bg-grey-2
        template(v-slot:append)
          q-btn(v-if="sources.includes('device') && url.length === 0" round flat color="green" icon="attach_file" @click="$refs.fileInput.click()").q-ml-sm
        //- template(v-slot:append)
        //-   q-btn(v-if="sources.includes('ws') && url.length === 0" round flat color="green" icon="add" @click="wsDialogShow = true").q-mr-sm
        //-   q-btn(v-if="!urlInputLoading && url.length > 0" round flat color="green" icon="clear" @click="url = ''").q-mr-sm
</template>

<script>
export default {
  name: 'contentFinder',
  props: ['sources'],
  components: {},
  data () {
    return {
      url: '',
      urlInputLoading: false,
      contentsShow: false,
      contentsWidth: 0,
      contentOrigins: ['youtube']
    }
  },
  computed: {
    progress () {
      return this.$store.state.events.progressUpload
    }
  },
  watch: {
    progress: {
      async handler (to, from) {
        this.$log('progress CHANGED', to)
        if (to) {
          if (to.progress === 100) {
            await this.$wait(1000)
            this.$store.commit('events/stateSet', ['progressUpload', null])
          }
        }
      }
    },
    url: {
      handler (to, from) {
        this.$log('url CHANGED', to)
        try {
          this.$log('url CHANGED WATCHER', to)
          if (new URL(to)) this.urlChanged(to)
          else this.$log('WRONG URL')
        } catch (e) {
          this.$log('URL WRONG', e)
        }
      }
    }
  },
  methods: {
    async urlChanged (url) {
      this.$log('urlChanged', url)
      this.urlInputLoading = true
      // TODO: show progress
      let content = await this.contentGetByUrl(url)
      this.$emit('content', content)
      this.urlInputLoading = false
      this.url = ''
    },
    async fileChanged (e) {
      this.$log('fileChanged', e)
      let file = e.target.files['0']
      this.$log('file', file)
      let url = URL.createObjectURL(file)
      // this.videoUrl = url
      // this.videoShow = true
      let content = await this.contentGetByFile(file)
      this.$emit('content', content)
      this.urlInputLoading = false
      this.url = ''
    },
    async contentPreview () {
      this.$log('contentPreview')
    },
    async contentChoose () {
      this.$log('contentChoose')
    },
    async contentGetByUrl (url) {
      try {
        this.$log('contentGetByUrl start', url)
        let contentCreateFromUrl = await this.$store.dispatch('content/contentCreateFromUrl', url)
        this.$log('contentGetByUrl done')
        return contentCreateFromUrl
      } catch (e) {
        this.$log('contentGetByUrl error', e)
        // TODO count tries...
        // this.contentGetByUrl(url)
      }
    },
    async contentGetByFile (file) {
      this.$log('contentGetByFile start', file)
      let contentCreateFromFile = await this.$store.dispatch('content/contentCreateFromFile', file)
      this.$log('contentGetByFile done')
      return contentCreateFromFile
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
