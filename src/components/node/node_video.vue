<template lang="pug">
div(style=`position: relative; maxWidth: 100%`).row.fit
  //- img(v-show="!started" :src="preview" :style=`{position: 'absolute', zIndex: index+20, objectFit: 'cover'}` width="100%" draggable="false")
  video(:ref="ref" playsinline preload="none" :src="url" type="video/mp4" height="100%" width="100%" @error="videoError" autoplay :poster="preview")
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
      started: false
    }
  },
  computed: {
    ref () {
      return `kplayer-${this.index}-${Date.now()}`
    }
  },
  watch: {
    // visible: {
    //   immediate: false,
    //   handler (to, from) {
    //     this.$log('visible CHANGED', to)
    //     if (to) this.player.play()
    //     else this.player.pause()
    //   }
    // }
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
      this.started = true
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
      pauseOtherPlayers: false,
      alwaysShowControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        // this.player.addEventListener('timeupdate', this.timeUpdate, false)
        this.player.addEventListener('playing', this.playing, false)
        // this.player.setCurrentTime(this.startSec)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.player.removeEventListener('timeupdate', this.timeUpdate)
    this.player.removeEventListener('playing', this.playing)
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
