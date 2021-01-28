<template lang="pug">
div(
  :style=`{
    position: 'relative',
    ...styles,
  }`
  ).row.full-width.items-start.content-start.justify-center
  video(
    @click="playing ? pause() : play()"
    ref="videoRef"
    type="video/mp4"
    :playsinline="true"
    :autoplay="true"
    :loop="true"
    :muted="muted"
    :style=`{
      borderRadius: '10px',
      //- objectFit: objectFit,
      //- overflow: 'hidden',
      ...styles,
    }`
    @canplay="canplayHandle"
    @waiting="waitingHandle"
    @loadeddata="loadeddataHandle"
    @timeupdate="timeupdateHandle"
    @play="playHandle"
    @playing="playingHandle"
    @pause="pauseHandle").full-width
    source(:src="contentKalpa.url")
</template>

<script>
export default {
  name: 'playerVideo__playerKalpa',
  props: {
    contentKalpa: {type: Object, required: true},
    url: {type: String, required: true},
    // objectFit: {type: String, default () { return 'cover' }},
    styles: {
      type: Object,
      default () {
        return {
          height: '100%',
          objectFit: 'cover',
        }
      }
    }
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
      figureOffset: null,
      figures: [],
      points: [],
      isFullscreen: false,
      waiting: false,
      canplay: false,
      playing_: false,
    }
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
      if (this[key] === undefined) return
      this.$set(this, key, val)
      if (key === 'muted') {
        if (this.$q.platform.is.capacitor || this.$q.platform.is.desktop) {
          localStorage.setItem('k_muted', val)
          // let muted = localStorage.setItem('muted', 'false')
          // if (muted === 'false') {
          //   this.player.setState('muted', false)
          // }
        }
      }
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      if (this.figureOffset) {
        t += this.figureOffset[0].t
      }
      // this.currentTime = t
      if (this.$refs.videoRef) this.$refs.videoRef.currentTime = t
    },
    play () {
      // this.$log('play')
      this.$refs.videoRef.play()
    },
    pause () {
      // this.$log('pause')
      this.$refs.videoRef.pause()
    },
    loadeddataHandle (e) {
      // this.$log('loadeddataHandle', e)
      let duration
      if (this.$refs.videoRef && this.$refs.videoRef.duration > 0) {
        duration = this.$refs.videoRef.duration
      }
      else {
        duration = this.contentKalpa.duration
      }
      if (this.figureOffset) {
        duration = this.figureOffset[1].t - this.figureOffset[0].t
      }
      this.duration = duration
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      if (this.$refs.videoRef) {
        if (this.figureOffset) {
          this.currentTime = this.$refs.videoRef.currentTime - this.figureOffset[0].t
          // handle currentTime here ?
          // if (this.currentTime < 0 && this.currentTime > this.duration) {
          //   this.player.setCurrentTime(0)
          // }
        }
        else {
          this.currentTime = this.$refs.videoRef.currentTime
        }
      }
    },
    waitingHandle (e) {
      // this.$log('waitingHandle', e)
      this.waiting = true
    },
    canplayHandle (e) {
      // this.$log('canplayHandle', e)
      this.canplay = true
    },
    playingHandle (e) {
      // this.$log('playingHandle', e)
      this.playing_ = true
    },
    playHandle (e) {
      // this.$log('playHandle', e)
      this.playing = true
    },
    pauseHandle (e) {
      // this.$log('pauseHandle', e)
      this.playing = false
    },
  },
  mounted () {
    // this.$log('mounted')
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
    this.$emit('player', this)
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    // alert('beforeDestroy')
    if (this.$refs.videoRef) {
      this.$refs.videoRef.src = ''
      this.$refs.videoRef.load()
    }
  }
}
</script>
