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
div(:style=`{position: 'relative'}`).row.fit.b-60
  div(:style=`{borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row.fit
    video(
      ref="videoRef"
      :src="content.url"
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
  video-controls(
    v-if="statePlayer"
    :statePlayer="statePlayer"
    :style=`{
      position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
      bottom: '-26px',
      left: 'calc(50% - 300px)',
      maxWidth: '600px',
    }`)
  //- tint on pause top
  //- transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
  //-   div(
  //-     v-if="showTint"
  //-     :style=`{
  //-       position: 'absolute', top: '0px', zIndex: 1000,
  //-       height: '5%',
  //-       background: 'rgb(0,0,0)',
  //-       background: 'linear-gradient(0deg, rgba(0,0,0,0) 100%, rgba(10,10,10,0.9) 0%)'
  //-     }`
  //-     ).row.full-width
  //- tint on pause bottom
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //- div(
  //-   v-if="showTint"
  //-   :style=`{
  //-     position: 'absolute', bottom: '0px', zIndex: 1000,
  //-     height: '20%',
  //-     background: 'rgb(0,0,0)',
  //-     background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)'
  //-   }`
  //-   ).row.full-width
</template>

<script>
import videoControls from './controls'

export default {
  name: 'wsContentPlayer-videoPlayer',
  components: {videoControls},
  props: ['content', 'key'],
  // inject: ['store'],
  data () {
    return {
      readyInterval: null,
      playingInterval: null,
      showTint: true
    }
  },
  computed: {
    statePlayer () {
      return {
        player: null,
        playing: false,
        loadeddata: false,
        currentTime: 0,
        duration: 0,
        fullscreen: 0,
        maxHeight: 0,
        set (key, val) {
          this[key] = val
        }
      }
    },
  },
  watch: {
    // 'statePlayer.playing': {
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('statePlayer.playing CHANGED', to)
    //     if (to) {
    //       await this.$wait(200)
    //       this.showTint = false
    //     }
    //     else {
    //       this.showTint = true
    //     }
    //   }
    // },
  },
  methods: {
    playPause () {
      this.$log('playPause')
      if (this.statePlayer.playing) this.statePlayer.player.pause()
      else this.statePlayer.player.play()
    },
    playerPlay () {
      this.$log('playerPlay')
      this.statePlayer.set('playing', true)
      if (this.playingInterval) this.playerIntervalStop()
      this.playingInterval = setInterval(this.playerTimeupdate, 50)
    },
    playerPause () {
      this.$log('playerPause')
      this.statePlayer.set('playing', false)
      this.playerIntervalStop()
    },
    playerIntervalStop () {
      this.$log('playingIntervalStop')
      clearInterval(this.playingInterval)
      this.playingInterval = null
    },
    playerLoadeddata () {
      this.$log('playerLoadeddata')
      this.statePlayer.set('playing', false)
      this.statePlayer.set('loadeddata', true)
      this.statePlayer.set('duration', this.statePlayer.player.duration)
      this.statePlayer.set('currentTime', this.statePlayer.player.currentTime)
      this.statePlayer.player.play()
    },
    playerTimeupdate () {
      // this.$log('playerTimeupdate', this.statePlayer.player.currentTime)
      this.statePlayer.set('currentTime', this.statePlayer.player.currentTime)
    },
    playerInit () {
      this.$log('playerInit start')
      // this.$log('playerInit videoRef', this.$refs.videoRef)
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
          this.statePlayer.set('player', mediaElement)
          this.$nextTick(() => {
            this.statePlayer.player.addEventListener('play', this.playerPlay)
            this.statePlayer.player.addEventListener('pause', this.playerPause)
            this.statePlayer.player.addEventListener('loadeddata', this.playerLoadeddata)
            // this.statePlayer.player.addEventListener('timeupdate', this.playerTimeupdate)
          })
          // this.$emit('ready', this.statePlayer)
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit error')
        }
      })
    }
  },
  async mounted () {
    this.$log('mounted', this.state)
    this.playerInit()
    // this.$set(this.store.state, this.stateKey, this.statePlayer)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.playingInterval) this.playerIntervalStop()
    if (!this.statePlayer.player) return
    this.statePlayer.player.removeEventListener('play', this.playerPlay)
    this.statePlayer.player.removeEventListener('pause', this.playerPause)
    this.statePlayer.player.removeEventListener('loadeddata', this.playerLoadeddata)
    // this.statePlayer.player.removeEventListener('timeupdate', this.playerTimeupdate)
    // destroy player
    this.statePlayer.player.pause()
    this.statePlayer.player.remove()
  }
}
</script>
