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
          height="100%")
          source(type="video/youtube" :src="url")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'nodeVideo',
  props: {
    url: {
      type: String,
      required: true
    },
    startSec: {
      type: Number
    },
    endSec: {
      type: Number
    }
  },
  data () {
    return {
      player: null,
      currentSec: 0,
      videoSec: 0
    }
  },
  methods: {
    timeUpdate (e) {
      this.$log('timeUpdate', e)
      this.videoSec = e.timeStamp
      if (e.timeStamp > this.startSec) this.editor.setCurrentTime(this.startSec)
    }
  },
  mounted () {
    this.$log('mounted')
    this.editor = new window.MediaElementPlayer(this.$refs.kplayer, {
      autoplay: true,
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
        this.editor.play()
        this.editor.setCurrentTime(this.startSec)
        this.$refs.kvideoWrapper.scrollTop = 50
        this.$refs.kplayer.addEventListener('timeupdate', this.timeUpdate, false)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$refs.kplayer.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
