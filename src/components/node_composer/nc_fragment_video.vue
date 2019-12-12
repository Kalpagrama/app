<style lang="stylus">
.mejs__playpause-button {
  display: none !important
}
</style>
<template lang="pug">
div(:style=`{position: 'relative', maxWidth: '100%'}`).row.full-width
  slot(name="actions" :now="now" :player="player")
  div(:style=`{position: 'relative'}`).row.full-width
    video(
      ref="ncFragmentVideo" :playsinline="true" crossorigin="Anonymous" :autoplay="true"
      :width="width" :height="height")
      source(:src="fragment.url || fragment.content.url" :type="fragment.content.contentSource === 'KALPA' ? 'video/mp4' : 'video/youtube'")
    div(
      :style=`{position: 'absolute', bottom: '16px', zIndex: 105, height: '12px'}`).row.full-width.q-px-md
      //- progress width
      div(:style=`{borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.4)'}` @click="progressClick").row.fit
        //- progress bar
        div(:style=`{width: (now/fragment.content.duration)*100+'%', pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden'}`
          ).row.full-height.bg-white.q-px-xs
      //- progress now/duration
      small(:style=`{position: 'absolute', zIndex: 105, top: '-24px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)'}`
        ).q-px-sm.text-white {{ $time(now) }} / {{ $time(fragment.content.duration) }}
  slot(name="editor" :now="now" :player="player")
</template>

<script>
export default {
  name: 'ncFragmentVideo',
  props: ['width', 'height', 'fragment', 'inEditor'],
  data () {
    return {
      now: 0,
      start: undefined,
      end: undefined,
      player: null,
      playing: false
    }
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick', this.fragment.content.duration)
      let w = e.target.clientWidth
      let x = e.offsetX
      let now = (this.fragment.content.duration * x) / w
      this.$log('w,x,now', w, x, now)
      this.player.setCurrentTime(now)
    },
    videoTimeupdate (e) {
      this.now = this.player.currentTime
    },
    videoSeeked (e) {
      this.$log('videoSeeked', e)
    },
    playerStart (width, height) {
      let me = new window.MediaElementPlayer(this.$refs.ncFragmentVideo, {
        loop: true,
        autoplay: true,
        controls: false,
        // useFakeFullscreen: true,
        features: ['playpause'],
        setDimensions: true,
        // enableKeyboard: false,
        // enableAutosize: true,
        // stretching: 'auto',
        videoWidth: width,
        videoHeight: height,
        clickToPlayPause: true,
        success: async (mediaElement, originalNode, instance) => {
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.videoTimeupdate)
          this.player.addEventListener('seeked', this.videoSeeked)
          this.player.play()
        }
      })
    }
  },
  async mounted () {
    this.$log('mounted')
    this.playerStart(this.width, this.height)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.removeEventListener('timeupdate', this.videoTimeupdate)
    this.player.removeEventListener('seeked', this.videoSeeked)
  }
}
</script>
