<template lang="pug">
div(:style=`{position: 'relative', minHeight: '74px'}`).row.full-width.items-center.content-center.bg-white
  div(v-if="!videoShow").row.full-width
    //- find in ws
    q-dialog(v-model="wsDialogShow" ref="wsDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      div(@click.self="wsDialogShow = false").row.fit.items-end.content-end.justify-center
        div(
          :style=`{maxHeight: $q.screen.height-60+'px', borderRadius: '10px 10px 0 0',
            overflow: 'hidden', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).column.fit.bg-grey-3
          .col.full-width
            ws-items(ctx="inEditor" :types="['fragments', 'contents']" @item="itemFound")
    //- url input & progress
    input(ref="fileInput" type="file" @change="fileChanged" :style=`{display: 'none'}` accept="video/*")
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      //- progress
      div(
        v-if="progress"
        :style=`{position: 'absolute', left: '0px', zIndex: 100}`).row.fit
        div(
          :style=`{position: 'absolute', left: '0px', zIndex: 100, width: progress.progress+'%', opacity: 0.5}`
          ).row.full-height.items-center.justify-center.bg-green
          span.text-white.text-bold {{ progress.progress }}%
      //- input url
      q-input(
        ref="urlInput" v-model="url" color="green"
        filled placeholder="Paste URL" :loading="urlInputLoading"
        ).full-width
        template(v-slot:prepend)
          q-btn(v-if="url.length === 0" round flat color="green" icon="attach_file" @click="$refs.fileInput.click()")
        template(v-slot:append)
          q-btn(v-if="url.length === 0" round flat color="green" icon="add" @click="wsDialogShow = true")
          q-btn(v-if="!urlInputLoading && url.length > 0" round flat color="green" icon="clear" @click="url = ''")
  //- video(
  //-   v-if="videoShow"
  //-   ref="videoRef" crossorigin="anonymous" autoplay="true" loop="true" playsinline="true" preload="auto"
  //-   :src="videoUrl"
  //-   @loadeddata="videoLoad" @error="videoError"
  //-   :style=`{width: '100%'}`)
  //- div(:style=`{
  //-   position: 'absolute', zIndex: 1000, top: '8px', opacity: 0.5,
  //-   height: $q.screen.height-130+'px',
  //-   borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-red
  //-   h1.text-white hello
</template>

<script>
import { fragments } from 'src/schema/fragments'
import wsItems from 'components/workspace/ws_items'

export default {
  name: 'fragmentFinder',
  components: {wsItems},
  data () {
    return {
      url: '',
      urlInputLoading: false,
      videoUrl: '',
      videoShow: false,
      videoLoaded: false,
      wsDialogShow: false
    }
  },
  computed: {
    progress () {
      return this.$store.state.events.progressUpload
    }
  },
  watch: {
    url: {
      handler (to, from) {
        try {
          this.$log('url CHANGED WATCHER', to)
          if (new URL(to)) this.urlChanged(to)
          else this.$log('WRONG URL')
        } catch (e) {
          this.$log('URL WRONG', e)
        }
      }
    },
    progress: {
      handler (to, from) {
        this.$log('progress CHANGED', to)
        if (to && to.progress === 100) this.$store.commit('events/stateSet', ['progressUpload', null])
      }
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item.type)
      if (this.$refs.wsDialog) this.$refs.wsDialog.hide()
      await this.$wait(600)
      switch (item.type) {
        case 'fragment': {
          this.$emit('fragment', item.item)
          break
        }
        case 'content': {
          let fragment = {
            url: '',
            name: '',
            thumbUrl: '',
            content: item.item,
            scale: item.item.duration,
            cuts: []
          }
          this.$emit('fragment', fragment)
          break
        }
      }
      this.url = ''
    },
    urlUse (url) {
      this.$log('urlUse', url)
      this.$q.notify({message: 'Pasted URL', color: 'green', textColor: 'white'})
      this.url = url
    },
    async urlChanged (to) {
      this.$log('url CHANGED', to)
      this.urlInputLoading = true
      // TODO: show progress
      let content = await this.contentGetByUrl(to)
      this.itemFound({type: 'content', item: content})
      this.urlInputLoading = false
    },
    async contentGetByUrl (url) {
      this.$log('contentGetByUrl start')
      let uploadContentUrl = await this.$store.dispatch('content/uploadContentUrl', url)
      this.$log('contentGetByUrl done')
      return uploadContentUrl
    },
    videoLoad (e) {
      this.$log('videoLoad', e)
      let h = this.$refs.videoRef.clientHeight
      let w = this.$refs.videoRef.clientWidth
      this.$log('h/w', h, w)
      this.vidoeLoaded = true
    },
    videoError (e) {
      this.$log('videoError', e)
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
      this.itemFound({type: 'content', item: content})
    },
    async contentGetByFile (file) {
      this.$log('contentGetByFile start')
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
