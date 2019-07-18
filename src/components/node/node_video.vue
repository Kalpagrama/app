<template lang="pug">
.row.fit
  video(:id="ref" playsinline height="100%" width="100%" preload="auto" :src="url" type="video/mp4" autoplay)
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'nodeVideo',
  props: {
    index: { type: Number, },
    height: { type: Number },
    width: { type: Number },
    url: { type: String, required: true },
    startSec: { type: Number, default: 0 },
    endSec: { type: Number, default: 10 },
    mini: {type: Boolean}
  },
  data () {
    return {
      me: null,
      player: null,
      muted: false,
      now: 0
    }
  },
  computed: {
    ref () {
      return `kplayer-${this.index}-${Date.now()}`
    }
  },
  watch: {
    url: {
      handler (to, from) {
        this.$log('url CHANGED', to)
        // this.$emit('started')
        if (this.index !== 0) this.player.setMuted(true)
        this.$emit('started')
      }
    }
  },
  methods: {
    toggleMute () {
      this.player.setMuted(!this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      this.now = this.player.currentTime
      if (this.player.currentTime > this.endSec) {
        this.$log('LOOP REPEAT')
        this.player.setCurrentTime(this.startSec)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // load player this.$refs[this.ref]
    this.me = new self.MediaElementPlayer(this.ref, {
      loop: true,
      autoplay: false,
      controls: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: true,
      iPhoneUseNativeControls: true,
      AndroidUseNativeControls: true,
      pauseOtherPlayers: false,
      alwaysShowControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        if (!this.mini) {
          this.player.addEventListener('timeupdate', this.timeUpdate, false)
          this.player.setCurrentTime(this.startSec)
        }
        // this.player.addEventListener('seeked', this.seeked, false)
        // this.player.play()
        this.$log('START PLAYING', this.index)
        // if (this.index !== 0) this.player.setMuted(true)
        this.$emit('started')
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!this.mini) this.player.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
</style>
