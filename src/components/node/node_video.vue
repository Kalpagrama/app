<template lang="pug">
div(style='position: relative').row.fit
  div(v-if="false" style=`position: absolute; zIndex: 300; top: 0px; opacity: 0.5`).row.full-width.q-pa-xs.bg-green-1
    small.full-width start:{{startSec}}
    small.full-width end:{{endSec}}
    small.full-width duration:{{endSec-startSec}}
  //- preview
  div(v-show="showPoster" :style=`{position: 'absolute', zIndex: zIndex+400}`).row.fit
    img(:src="preview" :width="width+'px'")
  video(:ref="ref" playsinline :height="height+'px'" :width="width+'px'" preload="none" :src="url" type="video/mp4" autoplay
    style=`zIndex: 200 `)
</template>

<script>
// import 'mediaelement/build/mediaelementplayer.min.css'
// import 'mediaelement/full'

export default {
  name: 'nodeVideo',
  props: {
    index: { type: Number, },
    zIndex: { type: Number },
    height: { type: Number },
    width: { type: Number },
    preview: { type: String },
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
      now: 0,
      showPoster: true
      // url: 'https://storage.yandexcloud.net/kalpa-content/8h/65/110124177519845405.mp4'
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
        // this.$log('*** --- URL CHANGED --- ***', to)
        this.showPoster = true
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
    },
    playing (e) {
      // this.$log('=== *** VIDEO STARTED *** ===')
      this.showPoster = false
    }
  },
  async mounted () {
    this.$log('mounted')
    this.me = new self.MediaElementPlayer(this.$refs[this.ref], {
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
        this.player.addEventListener('timeupdate', this.timeUpdate, false)
        this.player.addEventListener('playing', this.playing, false)
        this.$log('START PLAYING', this.index)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.timeUpdate)
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
