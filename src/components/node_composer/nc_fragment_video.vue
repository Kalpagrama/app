<template lang="pug">
div(:style=`{position: 'relative', maxWidth: '100%'}`).row.full-width
  video(
    ref="ncYoutube" :playsinline="true" crossorigin="Anonymous" :autoplay="true"
    @canplay="videoCanplay" @play="videoPlay" @playing="videoPlaying"
    :src="content.url" :type="content.contentSource === 'KALPA' ? 'video/mp4' : 'video/youtube'"
    :width="width" :height="height")
    //- source()
</template>

<script>
export default {
  name: 'ncFragmentVideo',
  props: ['width', 'height', 'fragment', 'content'],
  data () {
    return {
      now: 0,
      start: undefined,
      end: undefined,
      player: null,
      playing: false,
      playingHeight: 0,
      instance: null,
      imgWidth: 0,
      imgHeight: 0
    }
  },
  methods: {
    videoTimeupdate (e) {
      this.now = this.player.currentTime
      // this.$emit('now', this.now)
    },
    playerStart (width, height) {
      let me = new window.MediaElementPlayer(this.$refs.ncYoutube, {
        loop: true,
        autoplay: true,
        controls: true,
        useFakeFullscreen: true,
        alwaysShowControls: true,
        features: ['progress'],
        setDimensions: true,
        // enableAutosize: true,
        // stretching: 'auto',
        videoWidth: width,
        // defaultVideoWidth: width,
        videoHeight: height,
        // defaultVideoHeight: height,
        success: async (mediaElement, originalNode, instance) => {
          // this.$log('instance', instance)
          this.instance = instance
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.videoTimeupdate, false)
          this.player.setCurrentTime(0)
          this.player.play()
        }
      })
    }
  },
  mounted () {
    this.$log('mounted', this.content)
    this.playerStart(this.width, this.height)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.videoTimeupdate)
  }
}
</script>
