<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center
  video(
    @click="playing ? pause() : play()"
    ref="videoRef"
    :src="contentKalpa.url"
    type="video/mp4"
    :playsinline="true"
    :autoplay="false"
    :loop="true"
    :muted="muted"
    :style=`{
      objectFit: objectFit,
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    @loadeddata="loadeddataHandle"
    @timeupdate="timeupdateHandle"
    @play="playHandle"
    @pause="pauseHandle").fit
</template>

<script>
export default {
  name: 'playerVideo__playerKalpa',
  props: {
    contentKalpa: {type: Object, required: true},
    url: {type: String, required: true},
    objectFit: {type: String, default () { return 'cover' }}
  },
  data () {
    return {
      player: null,
      playing: false,
      currentTime: 0,
      duration: 0,
      muted: false,
      events: {},
      figures: [],
      points: [],
      isFullscreen: false,
    }
  },
  methods: {
    setState (key, val) {
      this.$log('setState', key, val)
      if (this[key] === undefined) return
      this.$set(this, key, val)
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      this.currentTime = t
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
      this.$log('loadeddataHandle', e)
      if (this.$refs.videoRef && this.$refs.videoRef.duration > 0) {
        this.duration = this.$refs.videoRef.duration
      }
      else {
        this.duration = this.contentKalpa.duration
      }
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      if (this.$refs.videoRef) this.currentTime = this.$refs.videoRef.currentTime
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
    this.$log('mounted')
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
    this.$log('beforeDestroy')
  }
}
</script>
