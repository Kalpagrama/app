<template lang="pug">
div(style=`position: relative; zIndex: 20; height: 200px; overflow: auto`).row.full-width
    div(style="position: absolute; zIndex: 200").row.full-width.items-center.justify-end.q-pa-sm
      q-btn(dense round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" @click="toggleMute").shadow-5
    div(style=`height: 200px; overflow: hidden` ref="kvideoWrapper").row.full-width
      div(style=`height: 300px; marginTop: -50px`).row.full-width
        video(:ref="ref" width="100%" height="100%" playsinline preload="auto")
          source(type="video/youtube" :src="url")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'nodeVideo',
  props: {
    index: { type: Number, },
    url: { type: String, required: true },
    startSec: { type: Number, default: 0 },
    endSec: { type: Number, default: 10 }
  },
  data () {
    return {
      player: null,
      mediaElement: null,
      muted: false
    }
  },
  computed: {
    ref () {
      return `kplayer-${this.index}`
    }
  },
  methods: {
    toggleMute () {
      this.mediaElement.setMuted(!this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      if (this.mediaElement.currentTime >= this.endSec) this.mediaElement.setCurrentTime(this.startSec)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$log('startSec', this.startSec)
    this.$log('endSec', this.endSec)
    this.$log('url', this.url)
    // load player
    this.player = new window.MediaElementPlayer(this.$refs[this.ref], {
      autoplay: true,
      controls: false,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.mediaElement = mediaElement
        this.mediaElement.addEventListener('timeupdate', this.timeUpdate, false)
        this.mediaElement.setCurrentTime(this.startSec)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.mediaElement.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
