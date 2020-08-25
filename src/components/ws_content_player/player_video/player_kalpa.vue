<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  video(
    ref="videoRef"
    :src="url"
    type="video/mp4"
    :playsinline="true"
    :autoplay="autoplay"
    :loop="loop"
    :muted="mutedLocal"
    :style=`{}`
    @loadeddata="loadeddataHandle"
    @timeupdate="timeupdateHandle"
    @play="playHandle"
    @pause="pauseHandle").fit
  slot
</template>

<script>
export default {
  name: 'playerVideo__playerKalpa',
  props: {
    url: {type: String, required: true},
    muted: {type: Boolean, default () { return true }},
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
      this.curerntTime = t
      this.$refs.videoRef.setCurrentTime(t)
    },
    loadeddataHandle (e) {
      this.$log('loadeddataHandle', e)
      this.duration = this.$refs.videoRef.duration
    },
    timeupdateHandle (e) {
      // this.$log('timeupdateHandle', e)
      this.currentTime = this.$refs.videoRef.currentTime
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
