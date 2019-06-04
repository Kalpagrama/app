<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  div(v-if="state === 'loading'").row.fit.items-center.justify-center
    //- q-spinner(size="50px" color="primary" :thickness="3"
  //- preview video
  //- view video
  div(v-if="type === 'video' && state === 'view'").row.fit
    div(style="position: absolute; zIndex: 200").row.full-width.justify-end.q-pa-xs
      slot(name="actions")
      q-btn(dense round flat icon="volume_up" color="white")
    div(style=`height: 200px; overflow: auto`).row.full-width
      div(style=`height: 300px`).row.full-width
        video(
          ref="kplayer"
          width="100%"
          playsinline
          controls="false"
          preload="auto"
          muted="true"
          height="100%")
          source(type="video/youtube" src="https://www.youtube.com/embed/5D0xD-YG64k")
  div(v-if="type === 'none'").row.fit.items-center.justify-center
    q-btn(icon="add" color="primary" flat round size="lg")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'fragment',
  props: {
    fragment: {
      default: () => {
        return {
          name: '',
          content: {
            type: 'VIDEO'
          }
        }
      }
    }
  },
  data () {
    return {
      id: Date.now().toString(),
      state: 'loading',
      states: ['loading', 'preview', 'editing', 'ready', 'new'],
      type: 'none',
      types: ['image', 'video', 'none'],
      editor: null,
      editorReady: false
    }
  },
  computed: {
    getHeight () {
      return 300
    }
  },
  methods: {
    start () {
      this.start()
    }
  },
  async mounted () {
    await this.$wait(2000)
    this.state = 'preview'
    // this.editor = new window.MediaElementPlayer(this.$refs.kplayer, {
    //   // pluginPath: '/path/to/shims/',
    //   // When using `MediaElementPlayer`, an `instance` argument
    //   // is available in the `success` callback
    //   autoplay: true,
    //   // controls: false,
    //   showPosterWhenPaused: false,
    //   clickToPlayPause: true,
    //   iPadUseNativeControls: false,
    //   iPhoneUseNativeControls: false,
    //   AndroidUseNativeControls: false,
    //   success: async (mediaElement, originalNode, instance) => {
    //     await this.$wait(1500)
    //     this.editorReady = true
    //     // this.editor.play()
    //   }
    // })
  }
}
</script>
