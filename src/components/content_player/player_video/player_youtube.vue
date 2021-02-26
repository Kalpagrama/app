<style lang="sass">
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  // z-index: 100
  border-radius: 10px
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
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.justify-center
  video(
    ref="videoRef"
    :src="contentKalpa.url"
    type="video/youtube"
    :playsinline="true"
    :autoplay="true"
    :loop="true"
    :muted="muted"
    :style=`{
      objectFit: 'contain'
    }`
    ).fit
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'

export default {
  name: 'playerVideo__playerYoutube',
  props: {
    contentKalpa: {type: Object, required: true},
  },
  data () {
    return {
      player: null,
      playing: false,
      currentTime: 0,
      duration: 0,
      muted: true,
      events: {},
      figure: null,
      figureFocused: null,
      figureOffset: null,
      figures: [],
      points: [],
      isFullscreen: false,
      clusters: [],
      playingCount: 0,
      nodePlaying: null,
    }
  },
  watch: {
    isFullscreen: {
      handler (to, from) {
        this.$log('isFullscreen TO', to)
        if (to) {
          this.$q.fullscreen.request()
            .then(() => {
              // success!
            })
            .catch(err => {
              this.$log('err', err)
            })
        }
        else {
          // Exiting fullscreen mode:
          this.$q.fullscreen.exit()
            .then(() => {
              // success!
            })
            .catch(err => {
              this.$log('err', err)
            })
        }
      }
    }
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
      if (this[key] === undefined) return
      this.$set(this, key, val)
      if (key === 'muted') {
        this.player.setMuted(val)
      }
    },
    // setMuted (val) {},
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      this.currentTime = t
      this.player.setCurrentTime(t)
    },
    play () {
      // this.$log('play')
      this.player.play()
    },
    pause () {
      // this.$log('pause')
      this.player.pause()
    },
    loadeddataHandle (e) {
      this.$log('loadeddataHandle')
      if (this.player && this.player.duration > 0) {
        this.duration = this.player.duration
      }
      else {
        this.duration = this.contentKalpa.duration
      }
      this.$emit('player', this)
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      this.currentTime = this.player.currentTime
    },
    playHandle (e) {
      this.$log('playHandle', this.playing)
      this.playing = true
      this.playingCount += 1
    },
    pauseHandle (e) {
      this.$log('pauseHandle', this.playing)
      this.playing = false
    },
    init () {
      this.$log('init start')
      // this.$log('playerInit videoRef', this.$refs.videoRef)
      let me = new window.MediaElementPlayer(this.$refs.videoRef, {
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
          this.$log('init done')
          this.player = mediaElement
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
          // this.$emit('player', this)
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
