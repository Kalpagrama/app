<template lang="pug">
div(style=`position: relative; height: 200px; overflow: auto`).row.full-width
    div(style="position: absolute; zIndex: 200").row.full-width.items-center.justify-end.q-pa-sm
      slot(name="actions")
      q-btn(dense round flat :icon="muted ? 'volume_up' : 'volume_off'" color="white" @click="toggleMute")
    div(style=`height: 200px; overflow: hidden` ref="kvideoWrapper").row.full-width
      div(style=`height: 300px`).row.full-width
        video(
          id="kvideo"
          ref="kplayer"
          @timeupdate.native="timeUpdate"
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
      type: Number,
      default: 0
    },
    endSec: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      player: null,
      currentSec: 0,
      videoSec: 0,
      video: null,
      muted: false
    }
  },
  methods: {
    toggleMute () {
      this.editor.setMuted(this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      // this.$log('timeUpdate', e)
      this.videoSec = e.timeStamp
      if (this.video.currentTime > this.endSec) this.editor.setCurrentTime(this.startSec)
      // if (e.timeStamp > this.endSec) this.editor.setCurrentTime(this.startSec)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$log('startSec', this.startSec)
    this.$log('endSec', this.endSec)
    // load player
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
        // this.editor.play()
        this.editor.setCurrentTime(this.startSec)
        this.$refs.kvideoWrapper.scrollTop = 50
        this.video = document.getElementById('kvideo')
        this.video.addEventListener('timeupdate', this.timeUpdate, false)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.video.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
