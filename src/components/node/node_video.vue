<template lang="pug">
video(
  :ref="ref" playsinline preload="none" :src="url" type="video/mp4"
  @error="videoError" autoplay
  @load="videoLoaded"
  @playing="videoStarted"
  :style=`{width: '100%', maxHeight: '100%', objectFit: 'contain'}`
  ).bg-grey-4
  //- @mouseenter="player.play()"
</template>

<script>
export default {
  name: 'nodeVideo',
  props: {
    mini: {type: Boolean},
    index: { type: Number, },
    zIndex: { type: Number },
    preview: {type: String},
    active: {type: Boolean},
    fragment: {type: Object, required: true}
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
      return `kplayer`
    },
    url () {
      return this.fragment.url
    },
    startSec () {
      return this.fragments.relativePoints[0]['x']
    },
    endSec () {
      return this.fragments.relativePoints[1]['x']
    }
  },
  watch: {
    url: {
      immediate: false,
      async handler (to, from) {
        this.$log('URL changed')
      }
    }
  },
  methods: {
    videoError (e) {
      this.$log('videoError', e)
    },
    videoLoaded (e) {
      this.$log('videoLoaded', e)
    },
    toggleMute () {
      this.player.setMuted(!this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      this.now = this.player.currentTime
      if (this.now > this.endSec) this.player.setCurrentTime(this.startSec)
    },
    videoStarted (e) {
      this.$log('videoStarted')
      this.$emit('started')
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
      pauseOtherPlayers: false,
      alwaysShowControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.player = mediaElement
        // this.player.addEventListener('playing', this.videoStarted, false)
        // this.player.addEventListener('timeupdate', this.timeUpdate, false)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.player.removeEventListener('playing', this.videoStarted)
    // this.player.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
.mejs__controls
  display: none !important
</style>
