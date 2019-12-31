<style lang="stylus">
.mejs__playpause-button {
  display: none !important;
  margin-top: 100px;
  margin-bottom: 100px
}
iframe {
  width: 100% !important;
  height: 100% !important;
}
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.bg-black
  q-btn(
    v-if="!mini"
    round flat color="white" @click="mutedToggle()"
    :style=`{position: 'absolute', zIndex: 103, left: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.15)'}`).shadow-1
    q-icon(:name="muted ? 'volume_off' : 'volume_up'" size="18px" color="white")
  //- play / pause TINT
  //- div(
  //-   @click="videoClick()"
  //-   :style=`{position: 'absolute', zIndex: 50, opacity: 0.5}`
  //-   ).row.fit.bg-red
  //- content
  small(
    v-if="!mini"
    @click="contentClick()"
    :style=`{
      position: 'absolute', zIndex: 103, top: fullscreen ? '208px' : '8px', left: '8px',
      background: 'rgba(0,0,0,0.5)', maxWidth: '70%', borderRadius: '10px', overflow: 'hidden'
    }`
    ).text-white.q-pa-sm.cursor-pointer {{ fragment.content.name }}
  video(
    ref="fragmentVideo" :playsinline="true" crossorigin="Anonymous" :autoplay="false" :loop="true" preload="auto"
    :muted="muted" allowfullscreen="false"
    width="100%" height="100%"
    @timeupdate="timeupdate" @seeked="seeked"
    @play="player.playing = true" @pause="player.playing = false"
    :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
    source(:src="videoSrc" :type="videoType")
  video-progress(
    v-if="player"
    :mini="mini" :now="now" :player="player"
    :style=`{position: 'absolute', bottom: fullscreen ? '200px' : '0px', zIndex: 105}`)
</template>

<script>
import videoProgress from './video_progress'

export default {
  name: 'nodeFragmentVideo',
  components: {videoProgress},
  props: ['ctx', 'fragment', 'mini', 'fullscreen'],
  data () {
    return {
      now: 0,
      player: null,
      muted: true
    }
  },
  computed: {
    videoSrc () {
      if (this.ctx === 'inEditor') {
        return this.fragment.content.url
      } else {
        return this.fragment.url
      }
    },
    videoType () {
      if (this.ctx === 'inEditor') {
        if (this.fragment.content.contentSource === 'YOUTUBE') {
          return 'video/youtube'
        } else {
          return 'video/mp4'
        }
      } else {
        return 'video/mp4'
      }
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
    videoClick () {
      this.$log('videoClick')
      if (this.mini) {
        this.$emit('mini')
      } else {
        this.playPause()
      }
    },
    ended () {
      this.$log('ended')
    },
    timeupdate () {
      // this.$log('timeupdate')
      if (this.ctx === 'inEditor') {
        // if (this.now !== 0 && this.now === this.player.currentTime) return
        this.now = this.player.currentTime
      } else {
        this.now = this.$refs.fragmentVideo.currentTime
        this.player.duration = this.$refs.fragmentVideo.duration
      }
    },
    seeked () {
      this.$log('seeked')
    },
    playPause () {
      this.$log('playPause')
      if (this.player.playing) this.player.pause()
      else this.player.play()
    },
    playing (e) {
      this.$log('playing', e)
      this.playing = true
      this.player.playing = true
    },
    paused () {
      this.$log('paused')
      this.playing = false
      this.player.playing = false
    },
    mutedToggle () {
      this.$log('mutedToggle')
      this.muted = !this.muted
    },
    contentClick () {
      this.$router.push('/content/' + this.fragment.content.oid)
    },
    playerInit () {
      this.$log('playerInit')
      if (this.ctx === 'inEditor') {
        let me = new window.MediaElementPlayer(this.$refs.fragmentVideo, {
          loop: true,
          autoplay: false,
          controls: false,
          features: [], // 'playpause'
          enableAutosize: true,
          stretching: 'fill',
          pauseOtherPlayers: false,
          // plugins: ['youtube'],
          // ignorePauseOtherPlayersOption: false,
          clickToPlayPause: true,
          success: async (mediaElement, originalNode, instance) => {
            this.player = mediaElement
            this.player.addEventListener('playing', this.playing, {passive: true})
            this.player.addEventListener('pause', this.paused, {passive: true})
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
        this.player = {}
        this.player.play = () => {
          this.$log('play')
          this.$refs.fragmentVideo.play()
        }
        this.player.pause = () => {
          this.$log('pause')
          this.$refs.fragmentVideo.pause()
        }
        this.player.duration = this.$refs.fragmentVideo.duration
        this.player.currentTime = this.$refs.fragmentVideo.currentTime
        this.player.setCurrentTime = (ms) => {
          this.$log('player.setCurrentTime', ms)
          this.$refs.fragmentVideo.currentTime = ms
        }
        this.player.setMuted = (muted) => {
          if (muted) localStorage.setItem('kmute', 'yes')
          else localStorage.removeItem('kmute')
          this.$refs.fragmentVideo.muted = muted
          this.muted = muted
        }
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
      this.player.removeEventListener('playing', this.playing)
      this.player.removeEventListener('pause', this.paused)
      this.player.removeEventListener('timeupdate', this.timeupdate)
      this.player.removeEventListener('seeked', this.seeked)
      this.player.remove()
    }
  }
}
</script>
