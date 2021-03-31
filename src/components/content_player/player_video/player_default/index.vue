<style lang="sass">
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  // z-index: 100
  // border-radius: 10px
  // overflow: hidden
  // pointer-events: none
// @media (min-width: 900px)
//   iframe[id$="_youtube_iframe"]
//     width: 1000%
//     height: 1000%
//     min-width: 1000%
//     min-height: 1000%
//     z-index: 100
//     border-radius: 10px
//     overflow: hidden
//     transform: scale(0.1)
//     transform-origin: top left
//     pointer-events: none
.mejs__overlay
  width: 100% !important
  height: 100% !important
  display: none !important
</style>

<template lang="pug">
video(
  ref="videoRef"
  type="video/youtube"
  :src="url"
  :playsinline="true"
  :autoplay="true"
  :loop="true"
  :muted="muted"
  :style=`{
    objectFit: 'contain'
  }`
  @loadeddata="videoLoadeddata"
  @timeupdate="videoTimeupdate"
  @pause="videoPaused"
  @play="videoPlaying"
  ).fit
</template>

<script>
import assert from 'assert'
import { ContentApi } from 'src/api/content'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'playerDefault',
  props: {
    contentKalpa: {type: Object, required: true},
    isVisible: {type: Boolean, default: true},
    isActive: {type: Boolean, default: true},
    isMini: {type: Boolean, default: false},
    options: {type: Object, default: {}},
  },
  data () {
    return {
      player_: null,
      playing: false,
      playingCount: 0,
      muted: false,
      duration: 0,
      currentTime: 0,
      figures: null, // Figures is selected to create the node in future
      nodeFocused: null, // When node is focused after Feeds and Creation
      nodeEditing: null, // When node is editing in content explorer
      events: null,
      clusters: [],
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.contentKalpa) },
    // Dynamic player depends on contentKalpa.url
    playerType () {
      if (this.url.includes('youtu')) return 'player-youtube' // контент не выкачан - показываем плеер ютуба
      else return 'player-kalpa' // есть выкачаннный контент
    }
  },
  methods: {
    setState (key, val) {
      this.$log('setState', key, val)
      this.$set(this, key, val)
    },
    play () {
      this.$log('play')
      this.playingCount += 1
      if (this.playerType === 'player-youtube') {
        this.player_.play()
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) this.$refs.videoRef.play()
      }
    },
    replay () {
      this.$log('replay')
      this.setCurrentTime(0)
      this.play()
    },
    pause () {
      this.$log('pause')
      if (this.playerType === 'player-youtube') {
        this.player_.pause()
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) this.$refs.videoRef.pause()
      }
    },
    mutedToggle (val) {
      this.$log('mutedToggle', val)
      if (this.playerType === 'player-youtube') {
        this.player_.setMuted(val || !this.player_.muted)
        this.muted = val || !this.muted
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.$refs.videoRef.muted = !this.$refs.videoRef.muted
          this.muted = val || !this.muted
        }
      }
    },
    forward (next) {
      // this.$log('forward', next)
      let t = this.player.currentTime
      if (next) t += 5
      else t -= 5
      if (t < 0) t = 0
      if (t > this.duration) t = this.duration
      this.setCurrentTime(t)
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      if (this.playerType === 'player-youtube') {
        this.currentTime = t
        this.player_.setCurrentTime(t)
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.currentTime = t
          this.$refs.videoRef.currentTime = t
        }
      }
    },
    videoLoadeddata (e) {
      // this.$log('videoLoadeddata', e)
      if (this.playerType === 'player-youtube') {
        this.duration = this.player_.duration
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.duration = this.$refs.videoRef.duration
        }
      }
      // Loaded!
      this.$nextTick(() => {
        this.$emit('player', this)
        if (localStorage.getItem('k_sound')) {
          this.mutedToggle(false)
        }
        // this.$q.notify('Player.play ! Internal')
        // this.play()
      })
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      if (this.playerType === 'player-youtube') {
        this.currentTime = this.player_.currentTime
        this.duration = this.player_.duration
      }
      else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.currentTime = this.$refs.videoRef.currentTime
          this.duration = this.$refs.videoRef.duration
        }
      }
    },
    videoPaused (e) {
      // this.$log('videoPaused', e)
      if (this.playerType === 'player-youtube') {
        this.playing = false
      }
      else if (this.playerType === 'player-kalpa') {
        this.playing = false
      }
    },
    videoPlaying (e) {
      // this.$log('videoPlaying', e)
      if (this.playerType === 'player-youtube') {
        this.playing = true
      }
      else if (this.playerType === 'player-kalpa') {
        this.playing = true
      }
    },
    playerCreate (type) {
      this.$log('playerCreate', type)
      if (type === 'player-youtube') {
        const me = new window.MediaElementPlayer(this.$refs.videoRef, {
          loop: true,
          muted: this.muted,
          autoplay: true,
          controls: true,
          features: [],
          // enableAutosize: true,
          // stretching: 'fill',
          pauseOtherPlayers: false,
          clickToPlayPause: true,
          // plugins: ['youtube'],
          success: async (mediaElement, originalNode, instance) => {
            this.$log('playerCreate done')
            this.player_ = mediaElement
            this.player_.addEventListener('loadeddata', this.videoLoadeddata)
            this.player_.addEventListener('timeupdate', this.videoTimeupdate)
            this.player_.addEventListener('pause', this.videoPaused)
            this.player_.addEventListener('play', this.videoPlaying)
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('playerCreate error')
            // this.$emit('error', mediaElement)
          }
        })
      }
      // else if (type === 'vimeo') {}
      // else if (type === 'instagram') {}
      else if (type === 'player-kalpa') {
      }
      // Add events bus for every player
      this.events = {
        on: (event, cb) => {
          if (this.$refs.videoRef) this.$refs.videoRef.addEventListener(event, cb)
        },
        off: (event, cb) => {
          if (this.$refs.videoRef) this.$refs.videoRef.removeEventListener(event, cb)
        },
        emit: (event, val) => {
          if (this.$refs.videoRef) this.$refs.videoRef.dispatchEvent(new CustomEvent(event, {detail: val}))
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$nextTick(() => {
      this.playerCreate(this.playerType)
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.playerType === 'player-youtube') {
      this.player_.removeEventListener('loadeddata', this.videoLoadeddata)
      this.player_.removeEventListener('timeupdate', this.videoTimeupdate)
      this.player_.removeEventListener('pause', this.videoPaused)
      this.player_.removeEventListener('play', this.videoPlaying)
      this.player_.remove()
      this.player_ = null
    }
  }
}
</script>
