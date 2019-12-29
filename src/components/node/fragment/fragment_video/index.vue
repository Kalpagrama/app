<style lang="stylus">
.mejs__playpause-button {
  display: none !important
}
iframe {
  width: 100% !important;
  height: 100% !important;
}
</style>
<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  q-btn(
    v-if="!mini"
    round flat color="white" @click="mutedToggle()"
    :style=`{position: 'absolute', zIndex: 103, left: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.15)'}`).shadow-1
    q-icon(:name="muted ? 'volume_off' : 'volume_up'" size="18px" color="white")
  video(
    ref="fragmentVideo" :playsinline="true" crossorigin="Anonymous" :autoplay="false" :loop="true" preload="auto"
    :muted="muted" allowfullscreen="false"
    width="100%" height="100%"
    :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
    source(
      :src="ctx === 'inEditor' ? fragment.content.url : fragment.url"
      :type="ctx !== 'inEditor' ? 'video/mp4' : fragment.content.contentSource === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'")
  video-progress(
    v-if="player"
    :mini="mini" :now="now" :player="player"
    :style=`{position: 'absolute', bottom: '0px', zIndex: 105}`)
</template>

<script>
import videoProgress from './video_progress'

export default {
  name: 'nodeFragmentVideo',
  components: {videoProgress},
  props: ['ctx', 'fragment', 'mini'],
  data () {
    return {
      now: 0,
      player: null,
      playing: false,
      muted: true
    }
  },
  watch: {
    muted: {
      handler (to, from) {
        this.$log('muted CHANGED', to)
        this.player.setMuted(to)
      }
    }
  },
  methods: {
    ended () {
      this.$log('ended')
    },
    timeupdate () {
      if (this.now !== 0 && this.now === this.player.currentTime) return
      // this.$log('timeupdate')
      if (this.ctx === 'inEditor') {
        this.now = this.player.currentTime
      } else {
        this.now = this.$refs.fragmentVideo.currentTime
      }
    },
    seeked () {
      this.$log('seeked')
    },
    touchstart (e) {
      this.$log('touchstart', e)
    },
    mutedToggle () {
      this.$log('mutedToggle')
      this.muted = !this.muted
    },
    playerInit () {
      this.$log('playerInit')
      if (this.ctx === 'inEditor') {
        let me = new window.MediaElementPlayer(this.$refs.fragmentVideo, {
          loop: true,
          // autoplay: false,
          controls: false,
          features: [], // 'playpause'
          // enableAutosize: true,
          // stretching: 'fill',
          pauseOtherPlayers: false,
          // plugins: ['youtube'],
          // ignorePauseOtherPlayersOption: false,
          clickToPlayPause: true,
          success: async (mediaElement, originalNode, instance) => {
            this.player = mediaElement
            this.player.addEventListener('timeupdate', this.timeupdate, {passive: true})
            this.player.addEventListener('seeked', this.seeked, {passive: true})
            this.muted = false
            this.player.play()
            this.$emit('player', this.player)
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('playerStart error')
          }
        })
      } else {
        this.$log('IMITATE PLAYER')
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.ctx === 'inEditor') {
      this.player.removeEventListener('timeupdate', this.timeupdate)
      this.player.removeEventListener('seeked', this.seeked)
      this.player.remove()
    }
  }
}
</script>
