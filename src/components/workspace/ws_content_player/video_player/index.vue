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
div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.fit.b-60
  slot(name="video")
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
    //- pause arrow
    q-btn(
      v-if="!playing && loadeddata"
      @click="play()"
      round flat color="white"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: 'calc(50% - 50px)', left: 'calc(50% - 50px)',
        width: '100px', height:'100px', borderRadius:'50%',
      }`)
      q-icon(name="play_arrow" size="100px" color="white")
    video-controls(
      v-if="options.controls && loadeddata"
      @seeked="$emit('seeked'), focused = true"
      :style=`{
        position: 'absolute', zIndex: 2000, bottom: '8px',
        left: '50%',
        marginRight: '-50%',
        transform: 'translate(-50%, 0)',
        maxWidth: videoControlsMaxWidth+'px',
      }`
      ).row.full-width
      template(v-slot:controls)
        slot(name="controls")
      template(v-slot:controlsTools)
        slot(name="controlsTools")
  //- tint on pause top
  transition(appear enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
    div(
      v-if="showTint"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 1000,
        height: '5%',
        background: 'rgb(0,0,0)',
        background: 'linear-gradient(0deg, rgba(0,0,0,0) 100%, rgba(10,10,10,0.9) 0%)',
        borderRadius: '0 0 10px 10px', overflow: 'hidden',
        transform: 'translate3d(0,0,0)',
      }`
      ).row.full-width
  //- tint on pause bottom
  div(
    v-if="showTint"
    :style=`{
      position: 'absolute', bottom: '0px', zIndex: 1000,
      height: '20%',
      background: 'rgb(0,0,0)',
      background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)',
      borderRadius: '10px 10px 0 0', overflow: 'hidden',
      transform: 'translate3d(0,0,0)',
    }`
    ).row.full-width
</template>

<script>
import videoControls from './controls'

export default {
  name: 'wsContentPlayer-videoPlayer',
  components: {videoControls},
  props: {
    sid: {type: String},
    content: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          controls: true
        }
      }
    }
  },
  data () {
    return {
      player: null,
      playingInterval: null,
      showTint: true,
      duration: 0,
      currentTime: 0,
      playing: false,
      loadeddata: false,
      focused: false,
    }
  },
  provide () {
    return {
      sidPlayer: this.sid
    }
  },
  computed: {
    videoControlsMaxWidth () {
      if (this.$q.screen.width > 600) return 600
      else return this.$q.screen.width - 80
    }
  },
  watch: {
    playing: {
      immediate: true,
      async handler (to, from) {
        this.$log('playing TO', to)
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
      if (this.playing) this.player.pause()
      else this.player.play()
    },
    play () {
      this.$log('play')
      this.player.play()
    },
    pause () {
      this.$log('pause')
      this.player.pause()
    },
    playerPlay () {
      this.$log('playerPlay')
      this.playing = true
      if (this.playingInterval) this.playerIntervalStop()
      this.playingInterval = setInterval(this.playerTimeupdate, 50)
    },
    playerPause () {
      this.$log('playerPause')
      this.playing = false
      this.playerIntervalStop()
    },
    playerIntervalStop () {
      this.$log('playingIntervalStop')
      clearInterval(this.playingInterval)
      this.playingInterval = null
    },
    playerLoadeddata () {
      this.$log('playerLoadeddata', this.player.duration)
      this.playing = false
      this.loadeddata = true
      this.duration = this.player.duration
      this.currentTime = this.player.currentTime
      this.player.play()
      this.$emit('ready')
    },
    playerTimeupdate () {
      // this.$log('playerTimeupdate', this.player.currentTime)
      this.currentTime = this.player.currentTime
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      this.currentTime = t
      this.player.currentTime = t
      this.focused = false
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
    this.$log('created', this.sid)
    window.stores[this.sid] = this
  },
  async mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.playingInterval) this.playerIntervalStop()
    if (this.player) {
      this.player.removeEventListener('play', this.playerPlay)
      this.player.removeEventListener('pause', this.playerPause)
      this.player.removeEventListener('loadeddata', this.playerLoadeddata)
      this.player.pause()
      this.player.remove()
    }
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
