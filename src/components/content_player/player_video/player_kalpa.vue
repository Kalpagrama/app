<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center
  video(
    @click="playing ? pause() : play()"
    ref="videoRef"
    :src="url"
    type="video/mp4"
    :playsinline="true"
    :autoplay="autoplay"
    :loop="loop"
    :muted="mutedLocal"
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
    url: {type: String, required: true},
    muted: {type: Boolean, default () { return true }},
    loop: {type: Boolean, default () { return true }},
    autoplay: {type: Boolean, default () { return true }},
    objectFit: {type: String, default () { return 'cover' }}
  },
  data () {
    return {
      player: null,
      playing: false,
      currentTime: 0,
      duration: 0,
      mutedLocal: false,
      isFullscreen: false,
      events: {},
      figures: [],
      points: [],
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
    stateSet (key, val) {
      if (!this[key]) return
      this[key] = val
    },
    fullscreenToggle () {
      this.$log('fullscreenToggle')
      this.isFullscreen = !this.isFullscreen
    },
    volumeToggle () {
      this.$log('volumeToggle')
      this.mutedLocal = !this.mutedLocal
      this.$refs.videoRef.muted = this.mutedLocal
    },
    play () {
      // this.$log('play')
      this.$refs.videoRef.play()
    },
    pause () {
      // this.$log('pause')
      this.$refs.videoRef.pause()
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      this.currentTime = t
      if (this.$refs.videoRef) this.$refs.videoRef.currentTime = t
    },
    loadeddataHandle (e) {
      this.$log('loadeddataHandle', e)
      // this.duration = this.$refs.videoRef.duration
      this.duration = e.path[0].duration || this.$refs.videoRef.duration
      // TODO: create player ??? with methods...
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
