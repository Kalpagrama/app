<template lang="pug">
.row.fit.items-center.content-center.justify-center
  div(:style=`{maxWidth: '500px'}`).row.full-width.items-center.content-center.justify-center
    //- input file
    input(
      v-if="sources.includes('device')"
      ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}` accept="video/*, image/*")
    //- input url
    div(
      v-if="sources.includes('url')"
      :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white
      div(
        v-if="progress"
        :style=`{position: 'absolute', zIndex: 100, left: 0, width: progress.progress+'%'}`
        ).row.full-height.bg-green
      q-input(
        v-model="url"
        color="green" placeholder="Paste URL of any content!"
        :loading="urlInputLoading"
        ).full-width
        template(v-slot:prepend)
          q-btn(v-if="sources.includes('device') && url.length === 0" round flat color="green" icon="attach_file" @click="$refs.fileInput.click()").q-ml-sm
        template(v-slot:append)
          q-btn(v-if="sources.includes('ws') && url.length === 0" round flat color="green" icon="add" @click="wsDialogShow = true").q-mr-sm
          q-btn(v-if="!urlInputLoading && url.length > 0" round flat color="green" icon="clear" @click="url = ''").q-mr-sm
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
      // this.itemFound({type: 'content', item: content})
      // this.$router.push('/content/' + content.oid)
      this.$emit('content', content)
      this.urlInputLoading = false
    },
    async fileChanged (e) {
      this.$log('fileChanged', e)
      let file = e.target.files['0']
      this.$log('file', file)
      let url = URL.createObjectURL(file)
      // this.videoUrl = url
      // this.videoShow = true
      let content = await this.contentGetByFile(file)
      this.$log('content', content)
      this.$router.push('/content/' + content.oid)
      // this.itemFound({type: 'content', item: content})
    },
    async contentPreview () {
      this.$log('contentPreview')
    },
    async contentChoose () {
      this.$log('contentChoose')
    },
    async contentGetByUrl (url) {
      this.$log('contentGetByUrl start', url)
      let uploadContentUrl = await this.$store.dispatch('content/uploadContentUrl', url)
      this.$log('contentGetByUrl done')
      return uploadContentUrl
    },
    async contentGetByFile (file) {
      this.$log('contentGetByFile start', file)
      let uploadContentFile = await this.$store.dispatch('content/uploadContentFile', file)
      this.$log('contentGetByFile done')
      return uploadContentFile
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
