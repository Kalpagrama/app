<template lang="pug">
div(style=`position: relative; zIndex: 200; overflow: auto`).row.fit
  div(style="position: absolute; zIndex: 200").row.full-width.items-center.justify-end.q-pa-sm
    q-btn(dense round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" @click="toggleMute").shadow-5
  div(style=`position: relative; height: 100%; overflow: hidden`).row.full-width
    div(style=`position: relative; height: 100%`).row.full-width.items-center.content-center
      video(:ref="ref" width="100%" height="100%" playsinline preload="auto" :src="url" type="video/mp4" autoplay)
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
      muted: false,
      urlFull: '',
      urls: [
        'https://cs.kalpagramma.com/thumbs/sc/us/108394685759791108_fragments/92.29942356687899-181.09380573248407_600.mp4',
        'https://cs.kalpagramma.com/thumbs/sc/us/108394685759791108_fragments/136.69661464968152-181.09380573248407_600.mp4'
      ],
      switching: false
    }
  },
  computed: {
    ref () {
      return `kplayer-${this.index}-${Date.now()}`
    }
  },
  watch: {
    url: {
      async handler (to, from) {
        // this.switching = true
        this.$log('url CHANGED')
        // await this.$wait(2000)
        this.$emit('ready', true)
        // this.switching = false
      }
    }
  },
  methods: {
    toggleMute () {
      this.mediaElement.setMuted(!this.muted)
      this.muted = !this.muted
    },
    timeUpdate (e) {
      // if (this.mediaElement.currentTime >= this.endSec) this.mediaElement.setCurrentTime(this.startSec)
    }
  },
  async mounted () {
    this.$log('mounted')
    // load player
    this.player = new window.MediaElementPlayer(this.$refs[this.ref], {
      loop: true,
      autoplay: true,
      controls: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.mediaElement = mediaElement
        this.mediaElement.play()
        this.$emit('started')
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.mediaElement.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>

<style lang="stylus">
.mejs__overlay-button
  display: none !important
.mejs__overlay-loading
  display: none !important
</style>
