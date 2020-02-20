<style lang="stylus">
iframe {
  width: 100%;
  height: 100%;
  z-index: 100;
}
.mejs__overlay-button {
  display: none;
}
</style>

<template lang="pug">
div(:style=``).column.fit.items-start.content-start.bg-black
  //- debug
  div(
    v-if="!mini"
    :style=`{position: 'absolute', left: '16px', top: '70px', zIndex: 10000, borderRadius: '10px'}`).row.q-pa-sm.bg-green
    span.full-width.text-white duration/now: {{duration}}/{{now}}
  //- video container
  div(:style=`{position: 'relative', overflow: 'hidden'}`).col.full-width
    div(:style=`{position: 'absolute', zIndex: 11, top: '0px', height: 'calc(100% + 0px)'}`).row.full-width
      video(
        ref="kalpaVideo"
        :src="src" :type="source === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'"
        playsinline loop :autoplay="ctx === 'workspace' || ctx === 'editor'" :muted="muted" preload="auto"
        @loadeddata="videoLoadeddata" @click="videoClick" @play="videoPlay" @pause="videoPause" @ended="$emit('ended')"
        :style=`{
          width: '100%', height: '100%', objectFit: 'contain'
        }`)
    player-video-progress(v-if="ctx === 'workspace' || ctx === 'editor'" :now="now" :duration="duration" :player="player" :videoUpdate="videoUpdate")
  slot(name="editor" :meta="{now, duration, playing, muted, progressHeight}" :player="player")
</template>

<script>
import playerVideoProgress from './player_video_progress'

export default {
  name: 'playerVideo',
  props: ['ctx', 'url', 'src', 'source', 'mini', 'fullHeight', 'active', 'visible'],
  components: {playerVideoProgress},
  data () {
    return {
      now: 0,
      duration: 0,
      player: null,
      playing: false,
      muted: true,
      fullscreen: false,
      intervalUpdate: null,
      intervalMove: null,
      progressShow: false,
      progressHeight: 20
    }
  },
  computed: {
    videoStyles () {
      if (this.fullscreen) {
        return {
          position: 'fixed !important',
          zIndex: 20000,
          height: '100%',
          width: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      } else {
        return {
          position: 'relative'
        }
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler (to, from) {
        // if (to && this.player.play) this.player.setCurrentTime(this.start)
      }
    },
    source: {
      immediate: true,
      handler (to, from) {
        this.$log('source CHANGED', to)
        if (to) {
          if (this.$refs.kalpaVideo) this.playerInit(to)
        }
      }
    },
    src: {
      immediate: true,
      async handler (to, from) {
        // this.$log('src CHANGED', to)
        if (to) {
          if (this.player) this.player.remove()
          this.playerInit(this.source)
        }
      }
    }
  },
  methods: {
    async videoMove () {
      if (!this.fullscreen) return
      this.$log('videoMove')
      this.$set(this.player, 'controls', true)
      if (this.intervalMove) clearInterval(this.intervalMove)
      this.intervalMove = setTimeout(() => {
        this.$set(this.player, 'controls', false)
      }, 2500)
    },
    videoLoadeddata () {
      this.$log('videoLoadeddata')
      this.intervalUpdate = setInterval(this.intervalUpdate, 1000 / 60)
    },
    videoPlay () {
      this.$log('videoPlay')
      this.playing = true
      if (!this.intervalUpdate) this.intervalUpdate = setInterval(this.videoUpdate, 1000 / 60)
    },
    videoPause () {
      this.$log('videoPause')
      this.playing = false
      if (this.intervalUpdate) clearInterval(this.intervalUpdate)
      this.intervalUpdate = null
    },
    videoPlayPause () {
      this.$log('videoPlayPause')
      if (this.playing) this.player.pause()
      else this.player.play()
    },
    videoSeeked () {
      this.$log('videoSeeked')
      this.videoUpdate()
    },
    videoUpdate (to) {
      // this.$log('videoStep', this.now)
      if (this.source === 'YOUTUBE') {
        this.now = to || this.player.currentTime
        this.duration = this.player.duration
      }
      else {
        if (!this.$refs.kalpaVideo) return
        this.now = to || this.$refs.kalpaVideo.currentTime
        this.duration = this.$refs.kalpaVideo.duration
      }
      // this.$emit('now', to || this.now)
    },
    async videoClick (e) {
      this.$log('videoClick')
      // TODO switch case mute/unmute play/pause
      this.muted = !this.muted
      this.videoPlayPause()
    },
    videoFullscreen () {
      this.$log('videoFullscreen')
      this.fullscreen = !this.fullscreen
      this.$q.fullscreen.toggle()
    },
    playerDelete () {},
    playerInit (source) {
      this.$log('playerInit', source)
      if (source === 'KALPA') {
        this.player = {}
        this.player.setCurrentTime = (ms) => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.currentTime = ms
        }
        this.player.play = () => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.play()
        }
        this.player.pause = () => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.pause()
        }
        this.player.remove = () => {
          // TODO
        }
        this.videoUpdate()
        this.videoPlay()
      }
      else {
        let me = new window.MediaElementPlayer(this.$refs.kalpaVideo, {
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
            this.$log('player YOUTUBE success')
            this.player = mediaElement
            this.player.addEventListener('play', this.videoPlay)
            this.player.addEventListener('pause', this.videoPause)
            this.player.addEventListener('loadeddata', this.videoLoadeddata)
            this.videoUpdate()
            this.videoPlay()
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('player YOUTUBE error')
          }
        })
      }
      this.$emit('player', this.player)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.playerInit(this.source)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.source === 'YOUTUBE') {
      this.player.removeEventListener('play', this.videoPlay)
      this.player.removeEventListener('pause', this.videoPause)
      this.player.removeEventListener('loadeddata', this.videoLoadeddata)
    }
  }
}
</script>
