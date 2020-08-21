<style lang="sass">
// iframe
//   width: 100%
//   max-width: 100%
//   height: 100%
//   // min-height: 100%
//   border-radius: 10px !important
//   overflow: hidden !important
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  z-index: 100
  border-radius: 10px
  overflow: hidden
  pointer-events: none
@media (min-width: 600px)
  iframe[id$="_youtube_iframe"]
    width: 1000%
    height: 1000%
    min-width: 1000%
    min-height: 1000%
    z-index: 100
    border-radius: 10px
    overflow: hidden
    transform: scale(0.1)
    transform-origin: top left
    pointer-events: none
.mejs__overlay
  width: 100% !important
  height: 100% !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  video(
    ref="videoRef"
    :src="url"
    type="video/youtube"
    :playsinline="true"
    :autoplay="true"
    :loop="true"
    :style=`{}`
    ).fit
  //- span(
  //-   :style=`{position: 'absolute', bottom: '0px'}`).row.full-width.bg-red.q-pa-sm.br
  //-   span.text-white {{ currentTime }}
</template>

<script>
export default {
  name: 'contentPlayer',
  props: ['url'],
  data () {
    return {
      player: null,
      currentTime: 0,
      duration: 0,
    }
  },
  methods: {
    play () {
      this.$log('play')
      this.player.play()
    },
    pause () {
      this.$log('pause')
      this.player.pause()
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      this.currentTime = this.player.currentTime
      this.duration = this.player.duration
      // this.$emit('currentTime', this.currentTime)
    },
    init () {
      this.$log('init start')
      // this.$log('playerInit videoRef', this.$refs.videoRef)
      let me = new window.MediaElementPlayer(this.$refs.videoRef, {
        loop: true,
        autoplay: true,
        controls: true,
        features: [],
        // enableAutosize: true,
        // stretching: 'fill',
        pauseOtherPlayers: false,
        clickToPlayPause: true,
        // plugins: ['youtube'],
        success: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit done')
          this.player = mediaElement
          this.$emit('player', this.player)
          // this.$nextTick(() => {
          //   this.player.addEventListener('play', this.playerPlay)
          //   this.player.addEventListener('pause', this.playerPause)
          this.player.addEventListener('timeupdate', this.timeupdateHandle, false)
          //   this.player.addEventListener('loadeddata', this.playerLoadeddata)
          // })
          this.player.play()
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit error')
        }
      })
    }
  },
  mounted () {
    this.$log('mounted')
    this.init()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // if (this.playingInterval) this.playerIntervalStop()
    if (this.player) {
      this.player.removeEventListener('timeupdate', this.timeupdateHandle)
      // this.player.removeEventListener('play', this.playerPlay)
      // this.player.removeEventListener('pause', this.playerPause)
      // this.player.removeEventListener('loadeddata', this.playerLoadeddata)
      this.player.pause()
      this.player.remove()
    }
  }
}
</script>
