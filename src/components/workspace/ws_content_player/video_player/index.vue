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
    video-controls(
      :statePlayer="statePlayer"
      :style=`{
        position: 'absolute', zIndex: 2000, bottom: '0px',
        left: '50%',
        marginRight: '-50%',
        transform: 'translate(-50%, 0)',
        maxWidth: '600px',
      }`
      ).row.full-width.q-py-sm
  //-     //- bar tools
  //-     div(
  //-       :style=`{
  //-         position: 'relative',
  //-         borderRadius: '10px', overflow: 'hidden',
  //-         background: 'rgba(0,0,0,0.1)',
  //-       }`).row.full-width.q-mb-xs
  //-       q-btn(
  //-         round flat dense color="white"
  //-         icon="play_arrow")
  //-       q-btn(
  //-         round flat dense color="white"
  //-         icon="volume_up")
  //-       .col
  //-       q-btn(flat dense color="white")
  //-         small {{ $time(state.currentTime) }}
  //-         small.q-mx-xs /
  //-         small {{ $time(state.duration) }}
  //-       .col
  //-       q-btn(
  //-         round flat dense color="white"
  //-         icon="fullscreen")
  //-       q-btn(
  //-         round flat dense color="white"
  //-         icon="more_vert")
  //-     //- bar
  //-     div(
  //-       v-if="state"
  //-       :style=`{
  //-         position: 'relative',
  //-         height: '50px',
  //-         borderRadius: '10px',
  //-         background: 'rgba(60,60,60,0.5)',
  //-       }`).row.full-width.q-mb-sm
  //-       div(
  //-         :style=`{
  //-           position: 'absolute', zIndex: 1000,
  //-           top: '-4px',
  //-           left: state.currentTime/state.duration*100+'%',
  //-           height: 'calc(100% + 8px)',
  //-           width: '4px',
  //-           borderRadius: '2px',
  //-           overflow: 'hidden',
  //-         }`).bg-green
  //-     slot(name="bar")
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
  props: ['sid', 'content'],
  data () {
    return {
      player: null,
      playingInterval: null,
      showTint: true
    }
  },
  computed: {
    statePlayer () {
      return {
        state: this.$store.state[this.sid],
        stateSet: (key, val) => {
          this.$store.commit(`${this.sid}/stateSet`, [key, val])
        },
        commit: (mutation, val) => {
          this.$store.commit(`${this.sid}/${mutation}`, val)
        },
        dispatch: (action, val) => {
          return this.$store.dispatch(`${this.sid}/action`, val)
        },
        getter (getter) {
          return this.$store.getters[`${this.sid}/getter`]
        }
      }
    }
  },
  provide () {
    return {
      statePlayer: this.statePlayer
    }
  },
  methods: {
    playPause () {
      this.$log('playPause')
      if (this.statePlayer.state.playing) this.player.pause()
      else this.player.play()
    },
    playerPlay () {
      this.$log('playerPlay')
      // this.$store.commit(`${this.storeKey}/stateSet`, ['playing', true])
      this.statePlayer.stateSet('playing', true)
      if (this.playingInterval) this.playerIntervalStop()
      this.playingInterval = setInterval(this.playerTimeupdate, 50)
    },
    playerPause () {
      this.$log('playerPause')
      // this.$store.commit(`${this.storeKey}/stateSet`, ['playing', false])
      this.statePlayer.stateSet('playing', false)
      this.playerIntervalStop()
    },
    playerIntervalStop () {
      this.$log('playingIntervalStop')
      clearInterval(this.playingInterval)
      this.playingInterval = null
    },
    playerLoadeddata () {
      this.$log('playerLoadeddata')
      this.statePlayer.stateSet('playing', false)
      this.statePlayer.stateSet('loadeddata', true)
      this.statePlayer.stateSet('duration', this.player.duration)
      this.statePlayer.stateSet('currentTime', this.player.currentTime)
      this.player.play()
    },
    playerTimeupdate () {
      // this.$log('playerTimeupdate', this.statePlayer.player.currentTime)
      this.statePlayer.stateSet('currentTime', this.player.currentTime)
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
    this.$store.registerModule(this.sid, {
      namespaced: true,
      state: () => {
        return {
          sid: _this.sid,
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
        play () {
          _this.player.play()
        },
        pause () {
          _this.player.pause()
        },
        setCurrentTime (state, val) {
          _this.$log('setCurrentTime', state, val)
          state.currentTime = val
          _this.player.setCurrentTime(val)
        },
      },
      // getters: {
      // }
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
    this.$store.unregisterModule(this.sid)
  }
}
</script>
