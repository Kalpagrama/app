<template lang="pug">
div(style=`position: relative; height: 200px; overflow: auto`).row.full-width
    div(style="position: absolute; zIndex: 200").row.full-width.items-center.justify-end.q-pa-sm
      slot(name="actions")
      q-btn(dense round flat icon="volume_up" color="white")
    div(style=`height: 200px; overflow: hidden` ref="kvideoWrapper").row.full-width
      div(style=`height: 300px`).row.full-width
        video(
          ref="kplayer"
          width="100%"
          playsinline
          controls="false"
          preload="auto"
          :poster="fragment.content.poster"
          height="100%")
          source(type="video/youtube" :src="fragment.content.url")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'nodeVideo',
  props: {
    fragment: {
      type: Object,
      default: () => {
        return {
          content: {
            url: 'https://www.youtube.com/embed/7Bms6Hba-3A'
          }
        }
      }
    }
  },
  data () {
    return {
      player: null
    }
  },
  mounted () {
    this.editor = new window.MediaElementPlayer(this.$refs.kplayer, {
      // pluginPath: '/path/to/shims/',
      // When using `MediaElementPlayer`, an `instance` argument
      // is available in the `success` callback
      autoplay: false,
      // controls: false,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        await this.$wait(600)
        this.$log('editorCreate sussess')
        // this.editorReady = true
        // this.editor.play()
        this.$refs.kvideoWrapper.scrollTop = 50
      }
    })
  }
}
</script>
