<template lang="pug">
div(style=`position: relative; zIndex: 200; overflow: auto`).row.fit
  //- video actions
  div(style="position: absolute; bottom: 0px; right: 0px; minHeight: 60px; zIndex: 200").row.items-center.justify-end.q-pa-sm
    //- slot(name="actions")
    q-btn(round :icon="muted ? 'volume_off' : 'volume_up'" color="primary" @click="toggleMute").shadow-5
  //- video wrapper
  div(style=`position: relative; height: 100%; overflow: hidden`).row.full-width
    div(style=`position: relative; height: 100%`).row.full-width.items-center.content-center
      video(:id="ref" width="100%" height="100%" playsinline preload="auto" :src="url" type="video/mp4" autoplay)
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
      if (this.player.currentTime >= this.endSec) {
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
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      pauseOtherPlayers: false,
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
        // this.$emit('started')
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
