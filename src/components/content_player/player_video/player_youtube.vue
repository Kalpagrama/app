<style lang="sass">
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  z-index: 100
  border-radius: 10px
  overflow: hidden
  pointer-events: none
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
</style>

<template lang="pug">
div(:style=`{position: 'relative', borderRadius: '0px', overflow: 'hidden', zIndex: 10}`).row.full-width.items-start.content-start.justify-center
  video(
    ref="videoRef"
    :src="url"
    type="video/youtube"
    :playsinline="true"
    :autoplay="autoplay"
    :muted="mutedLocal"
    :loop="loop"
    :style=`{}`
    ).fit
  //- tint on top
  div(
    :style=`{
      position: 'absolute', top: '0px', zIndex: 1000, transform: 'translate3d(0,0,0)', height: '10%',
      background: 'rgb(0,0,0)', background: 'linear-gradient(0deg, rgba(0,0,0,0) 100%, rgba(10,10,10,0.9) 0%)',
      borderRadius: '0 0 10px 10px', overflow: 'hidden', pointerEvents: 'none',
    }`).row.full-width
  //- tint on bottom
  div(
    :style=`{
      position: 'absolute', bottom: '0px', zIndex: 1000, transform: 'translate3d(0,0,0)', height: '20%',
      background: 'rgb(0,0,0)', background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)',
      borderRadius: '10px 10px 0 0', overflow: 'hidden', pointerEvents: 'none',
    }`).row.full-width
  slot
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'playerVideo__playerYoutube',
  props: {
    url: {type: String, required: true},
    muted: {type: Boolean, default () { return false }},
    loop: {type: Boolean, default () { return true }},
    autoplay: {type: Boolean, default () { return true }}
  },
  data () {
    return {
      player: null,
      playing: false,
      currentTime: 0,
      duration: 0,
      mutedLocal: false,
      events: {},
      isFullscreen: false,
    }
  },
  watch: {
    muted: {
      immediate: true,
      handler (to, from) {
        this.mutedLocal = to
      }
    }
  },
  methods: {
    fullscreenToggle (to) {
      this.$log('fullscreenToggle')
      this.isFullscreen = to === undefined ? !this.isFullscreen : to
    },
    volumeToggle () {
      this.$log('volumeToggle')
      this.mutedLocal = !this.mutedLocal
      this.player.setMuted(this.mutedLocal)
    },
    play () {
      // this.$log('play')
      this.player.play()
    },
    pause () {
      // this.$log('pause')
      this.player.pause()
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      // if (this.currentTimeBlocked) return
      this.currentTime = t
      this.currentTimeBlocked = true
      this.player.setCurrentTime(t)
      this.$wait(500).then(() => {
        this.currentTimeBlocked = false
      })
    },
    loadeddataHandle (e) {
      this.$log('loadeddataHandle', e)
      this.duration = this.player.duration
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      if (this.currentTimeBlocked) return
      this.currentTime = this.player.currentTime
    },
    playHandle (e) {
      // this.$log('playHandle', e)
      this.playing = true
    },
    pauseHandle (e) {
      // this.$log('pauseHandle', e)
      this.playing = false
    },
    init () {
      this.$log('init start')
      // this.$log('playerInit videoRef', this.$refs.videoRef)
      let me = new window.MediaElementPlayer(this.$refs.videoRef, {
        loop: this.loop,
        muted: this.muted,
        autoplay: this.autoplay,
        controls: true,
        features: [],
        // enableAutosize: true,
        // stretching: 'fill',
        pauseOtherPlayers: false,
        clickToPlayPause: true,
        // plugins: ['youtube'],
        success: async (mediaElement, originalNode, instance) => {
          this.$log('init done')
          this.player = mediaElement
          // this.$nextTick(() => {
          this.player.addEventListener('loadeddata', this.loadeddataHandle)
          this.player.addEventListener('timeupdate', this.timeupdateHandle, false)
          this.player.addEventListener('pause', this.pauseHandle)
          this.player.addEventListener('play', this.playHandle)
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
          // })
          this.$emit('player', this)
          this.player.play()
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('init error')
          this.$emit('error', mediaElement)
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
      this.player.removeEventListener('loadeddata', this.loadeddataHandle)
      this.player.removeEventListener('timeupdate', this.timeupdateHandle)
      this.player.removeEventListener('play', this.playHandle)
      this.player.removeEventListener('pause', this.pauseHandle)
      this.player.remove()
      this.player = null
    }
  }
}
</script>
