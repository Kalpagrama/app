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
  //- video-controls(
  //-   :style=`{
  //-     position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
  //-     bottom: '-26px',
  //-     left: 'calc(50% - 300px)',
  //-     maxWidth: '600px',
  //-   }`)
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
// import { mapMutations } from 'vuex'
import videoControls from './controls'

export default {
  name: 'wsContentPlayer-videoPlayer',
  components: {videoControls},
  props: ['id', 'content'],
  data () {
    return {
      player: null,
      playingInterval: null,
      showTint: true
    }
  },
  computed: {
    state () {
      return this.$store.state[this.id]
    },
  },
  watch: {
  },
  methods: {
    stateSet (key, val) {
      this.$store.commit(`${this.id}/stateSet`, [key, val])
    },
    playPause () {
      this.$log('playPause')
      if (this.state.playing) this.player.pause()
      else this.player.play()
    },
    playerPlay () {
      this.$log('playerPlay')
      // this.$store.commit(`${this.storeKey}/stateSet`, ['playing', true])
      this.stateSet('playing', true)
      if (this.playingInterval) this.playerIntervalStop()
      this.playingInterval = setInterval(this.playerTimeupdate, 50)
    },
    playerPause () {
      this.$log('playerPause')
      // this.$store.commit(`${this.storeKey}/stateSet`, ['playing', false])
      this.stateSet('playing', false)
      this.playerIntervalStop()
    },
    playerIntervalStop () {
      this.$log('playingIntervalStop')
      clearInterval(this.playingInterval)
      this.playingInterval = null
    },
    playerLoadeddata () {
      this.$log('playerLoadeddata')
      this.$store.commit(`${this.id}/stateSet`, ['playing', false])
      this.$store.commit(`${this.id}/stateSet`, ['loadeddata', true])
      this.$store.commit(`${this.id}/stateSet`, ['duration', this.player.duration])
      this.$store.commit(`${this.id}/stateSet`, ['currentTime', this.player.currentTime])
      this.player.play()
    },
    playerTimeupdate () {
      // this.$log('playerTimeupdate', this.statePlayer.player.currentTime)
      this.$store.commit(`${this.id}/stateSet`, ['currentTime', this.player.currentTime])
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
          this.player = mediaElement
          this.$nextTick(() => {
            this.player.addEventListener('play', this.playerPlay)
            this.player.addEventListener('pause', this.playerPause)
            this.player.addEventListener('loadeddata', this.playerLoadeddata)
          })
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('playerInit error')
        }
      })
    }
  },
  created () {
    this.$log('created')
    let _this = this
    this.$store.registerModule(this.id, {
      namespaced: true,
      state: () => {
        return {
          duration: 0,
          currentTime: 0,
          playing: false,
          loadeddata: false,
        }
      },
      mutations: {
        stateSet (state, [key, val]) {
          // _this.$log('stateSet', key, val)
          state[key] = val
        },
      },
      getters: {
      }
    })
  },
  async mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.playingInterval) this.playerIntervalStop()
    this.player.removeEventListener('play', this.playerPlay)
    this.player.removeEventListener('pause', this.playerPause)
    this.player.removeEventListener('loadeddata', this.playerLoadeddata)
    this.player.pause()
    this.player.remove()
    this.$store.unregisterModule(this.id)
  }
}
</script>
