<template lang="pug">
div(
  @mouseenter="player.play()"
).row.fit
  video(:ref="ref" playsinline preload="none" :src="url" type="video/mp4"
    height="100%" width="100%" @error="videoError" autoplay
    :style=`{maxHeight: '100%', height: '100%', objectFit: 'cover', maxWidth: '100%'}`)
</template>

<script>
export default {
  name: 'nodeVideo',
  props: {
    index: { type: Number, },
    zIndex: { type: Number },
    url: { type: String, required: true },
    startSec: { type: Number, default: 0 },
    endSec: { type: Number, default: 10 },
    mini: {type: Boolean},
    height: {type: Number},
    preview: {type: String},
    visible: {type: Boolean}
  },
  data () {
    return {
      me: null,
      player: null,
      muted: false,
      now: 0,
      showPoster: true,
      urlFake: 'https://storage.yandexcloud.net/kalpa-content/8h/65/110124177519845405.mp4',
      started: false,
      z: 0
    }
  },
  computed: {
    ref () {
      return `kplayer-${this.index}-${Date.now()}`
    }
  },
  watch: {
    url: {
      immediate: false,
      async handler (to, from) {
        // this.$log('URL changed')
        // this.started = false
        // this.z = 0
        // await this.$wait(330)
        // this.started = true
      }
    }
  },
  methods: {
    videoError () {
      this.$log('*** videoError')
    },
    toggleMute () {
      this.player.setMuted(!this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      this.now = this.player.currentTime
      if (this.now > this.endSec) this.player.setCurrentTime(this.startSec)
    },
    playing (e) {
      // this.$log('=== *** VIDEO STARTED *** ===')
      // this.showPoster = false
      // setTimeout(() => {
      //   this.started = true
      // }, 200)
      // this.started = true
      // this.$tween.to(this, 0.2, {z: 2000})
      this.$emit('started')
      this.$log('STARTED', this.index)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.me = new window.MediaElementPlayer(this.$refs[this.ref], {
      loop: true,
      autoplay: true,
      controls: false,
      muted: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      stretching: 'fill',
      pauseOtherPlayers: true,
      alwaysShowControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        // this.player.addEventListener('timeupdate', this.timeUpdate, false)
        // this.player.addEventListener('playing', this.playing, false)
        // this.player.setCurrentTime(this.startSec)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.player.removeEventListener('timeupdate', this.timeUpdate)
    // this.player.removeEventListener('playing', this.playing)
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
// .mejs__controls
//   display: none !important
</style>
