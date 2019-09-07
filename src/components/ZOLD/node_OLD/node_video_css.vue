<template lang="pug">
video(
  ref="kvideo"
  :src="inEditor ? fragment.content.url : fragment.url"
  :style=`{width: '100%', maxHeight: '100%', objectFit: 'contain'}`
  loop playsinline autoPictureInPicture
  @click="videoClick"
  @timeupdate="videoTimeupdate"
  @playing="videoStarted"
  @pause="videoPlaying = false")
</template>

<script>
export default {
  name: 'nodeVideo',
  props: ['fragment', 'active', 'index', 'inEditor'],
  data () {
    return {
      videoPlaying: false
    }
  },
  watch: {
    active: {
      handler (to, from) {
        if (to === false) this.$refs.kvideo.pause()
        if (to && this.index === 0) this.$refs.kvideo.play()
        // else this.$refs.kvideo.play()
      }
    }
  },
  methods: {
    videoClick () {
      this.$log('videoClick')
      if (this.videoPlaying) this.$refs.kvideo.pause()
      else this.$refs.kvideo.play()
    },
    videoStarted () {
      this.$log('videoStarted')
      this.videoPlaying = true
      // if (this.inEditor) this.$refs.kvideo.currentTime = this.fragment.relativePoints[0]['x']
      this.$emit('ready')
    },
    videoTimeupdate () {
      this.$log('videoTimeupdate')
      if (this.inEditor) {
        let now = this.$refs.kvideo.currentTime
        let startSec = this.fragment.relativePoints[0]['x']
        let endSec = this.fragment.relativePoints[1]['x']
        if (now >= endSec || now < startSec) {
          this.$log('START AGAIN!', startSec, endSec)
          this.$refs.kvideo.currentTime = startSec
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
