<style lang="sass">
// iframe[id$="_youtube_iframe"]
//   width: 100%
//   height: 100%
//   border-radius: 10px
//   overflow: hidden
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
.mejs__overlay-button
  display: none
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.full-width.b-60.fit
  video(
    ref="videoRef"
    :src="stateExplorer.content.url"
    type="video/youtube"
    :playsinline="true"
    :autoplay="true"
    :loop="false"
    :style=`{
      position: 'relative',
      width: '100%',
      objectFit: 'contain',
    }`
    ).fit
  //- tint on pause top
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="showTint"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 1000,
        height: '5%',
        background: 'rgb(0,0,0)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0) 100%, rgba(10,10,10,0.9) 0%)'
      }`
      ).row.full-width
  //- tint on pause bottom
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  div(
    v-if="showTint"
    :style=`{
      position: 'absolute', bottom: '0px', zIndex: 1000,
      height: '20%',
      background: 'rgb(0,0,0)',
      background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)'
    }`
    ).row.full-width
</template>

<script>
export default {
  name: 'contentPlayer',
  props: ['stateExplorer'],
  data () {
    return {
      playingInterval: null,
      showTint: true
    }
  },
  computed: {
  },
  watch: {
    'stateExplorer.playing': {
      immediate: true,
      async handler (to, from) {
        this.$log('stateExplorer.playing CHANGED', to)
        if (to) {
          await this.$wait(200)
          this.showTint = false
        }
        else {
          this.showTint = true
        }
      }
    },
  },
  methods: {
    playPause () {
      this.$log('playPause')
      if (this.stateExplorer.playing) this.stateExplorer.player.pause()
      else this.stateExplorer.player.play()
    },
    playerPlay () {
      this.$log('playerPlay')
      this.stateExplorer.set('playing', true)
      if (this.playingInterval) this.playerIntervalStop()
      this.playingInterval = setInterval(this.playerTimeupdate, 50)
    },
    playerPause () {
      this.$log('playerPause')
      this.stateExplorer.set('playing', false)
      this.playerIntervalStop()
    },
    playerIntervalStop () {
      this.$log('playingIntervalStop')
      clearInterval(this.playingInterval)
      this.playingInterval = null
    },
    playerLoadeddata () {
      this.$log('playerLoadeddata')
      this.stateExplorer.set('playing', false)
      this.stateExplorer.set('loadeddata', true)
      this.stateExplorer.set('duration', this.stateExplorer.player.duration)
      this.stateExplorer.set('currentTime', this.stateExplorer.player.currentTime)
      this.stateExplorer.player.play()
    },
    playerTimeupdate () {
      // this.$log('playerTimeupdate', this.stateExplorer.player.currentTime)
      this.stateExplorer.set('currentTime', this.stateExplorer.player.currentTime)
    },
    playerInit () {
      this.$log('playerInit start', this.$refs.videoRef)
      // alert('player WORKSPACE start')
      let me = new window.MediaElementPlayer(this.$refs.videoRef, {
        loop: false,
        autoplay: true,
        controls: true,
        features: [],
        // enableAutosize: true,
        // stretching: 'fill',
        pauseOtherPlayers: true,
        clickToPlayPause: true,
        // plugins: ['youtube'],
        success: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit done')
          this.stateExplorer.set('player', mediaElement)
          this.$nextTick(() => {
            this.stateExplorer.player.addEventListener('play', this.playerPlay)
            this.stateExplorer.player.addEventListener('pause', this.playerPause)
            this.stateExplorer.player.addEventListener('loadeddata', this.playerLoadeddata)
            // this.stateExplorer.player.addEventListener('timeupdate', this.playerTimeupdate)
          })
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit error')
        }
      })
    }
  },
  mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.playingInterval) this.playerIntervalStop()
    this.stateExplorer.player.removeEventListener('play', this.playerPlay)
    this.stateExplorer.player.removeEventListener('pause', this.playerPause)
    this.stateExplorer.player.removeEventListener('loadeddata', this.playerLoadeddata)
    // this.stateExplorer.player.removeEventListener('timeupdate', this.playerTimeupdate)
    // destroy player
    this.stateExplorer.player.pause()
    this.stateExplorer.player.remove()
  }
}
</script>
