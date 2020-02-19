<template lang="pug">
div(
  :style=`videoStyles`
  :class=`{'full-height': fullHeight || ctx === 'workspace'}`).row.full-width.items-center.content-center
  div(
    :class=`{'full-height': fullHeight || ctx === 'workspace'}`
    :style=`{position: 'relative'}`).row.full-width.items-center.content-center
    //- opacity: videoValid ? 1 : 0
    //- :autoplay="ctx === 'workspace'"
    video(
      ref="kalpaVideo"
      playsinline loop :muted="muted"
      @loadeddata="videoCanplay"
      @click="videoClick" @play="videoPlay" @pause="videoPause" @timeupdate="videoTimeupdate" @ended="$emit('ended')"
      :class=`{'full-height': fullHeight || ctx === 'workspace'}`
      :style=`{width: '100%', objectFit: 'contain', opacity: now > start ? 1 : 0}`
      :src="urlRaw" type="video/mp4")
      //- source()
    //- debug
    div(
      v-if="false"
      :style=`{position: 'absolute', left: '16px', bottom: '100px', zIndex: 10000, borderRadius: '10px'}`).row.q-pa-sm.bg-green
      //- span.full-width.text-white player: {{player}}
      //- small.text-white.full-width styles: {{videoStyles}}
      small.text-white.full-width url: {{ url }}
    //- fullscreen
    //- q-btn(
    //-   round flat color="green" @click="videoFullscreenToggle()"
    //-   :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
    //-   :style=`{position: 'absolute', top: '16px', right: '16px', zIndex: 1000, background: 'rgba(0,0,0,0.3)'}`)
    //- progress
    div(
      v-if="ctx === 'workspace'"
      v-show="!mini"
      :style=`{
        position: 'absolute', bottom: '16px', left: 0, zIndex: 1000}`
      ).row.full-width.items-start.content-start
      //- pregress wrapper
      .row.full-width.items-start.content-start.q-px-md
        //- progress actions
        div(:style=`{height: '60px'}`).row.full-width.items-center
          //- play/pause
          div(
            v-show="player.controls"
            :style=`{width: '44px'}`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              round flat color="green" @click="videoClick"
              :icon="player.playing === true ? 'pause' : 'play_arrow'"
              :style=`{background: 'rgba(0,0,0,0.3)'}`)
          .col
            .row.fit.items-center.content-center
              span(
                :style=`{pointerEvents: 'none', borderRadius: '10px', background: 'rgba(0,0,0,0.3)'}`
                ).text-white.q-pa-sm.q-ml-sm {{$time(now)+' / '+$time(player.duration)}}
          //- fullscreen
          div(
            v-show="player.controls"
            :style=`{width: '44px'}`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              round flat color="green" @click="videoFullscreenToggle()"
              :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
              :style=`{background: 'rgba(0,0,0,0.3)'}`)
        //- progress bar & time
        div(
          :style=`{height: progressHeight+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-10
          //- progress
          .col.full-height
            div(
              @click="progressClick"
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`
              ).row.fit.bg-grey-9.cursor-pointer
              //- progress %
              div(:style=`{position: 'absolute', zIndex: 100, left: 0, width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRight: '2px solid #4caf50'}`).row.full-height.bg-grey-7
      slot(name="layerEditor" :now="now" :player="player" :progressHeight="progressHeight")
</template>

<script>
export default {
  name: 'playerVideo',
  props: ['ctx', 'url', 'source', 'start', 'end', 'mini', 'fullHeight', 'active', 'visible'],
  data () {
    return {
      now: 0,
      player: {
        controls: true
      },
      moveInterval: null,
      progressHeight: 10,
      fullscreen: false,
      show: false,
      urlRaw: undefined,
      opacity: true,
      muted: true
    }
  },
  computed: {
    videoValid () {
      return this.now > this.start && this.now < this.end && this.player.playing
    },
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
    url: {
      immediate: true,
      async handler (to, from) {
        // this.$log('url CHANGED', to)
        if (to) {
          this.$set(this, 'urlRaw', to)
          if (this.player && this.player.play) {
            this.player.setCurrentTime(this.start)
            this.player.play()
            // this.muted = false
          }
        }
      }
    },
    now: {
      immediate: false,
      handler (to, from) {
        // this.$log('now CHANGED', to)
        // if (this.player && this.player.editing) return
        // if (!this.active) return
        if (this.start) {
          if (to <= this.start) {
            // this.$log('now < start')
            // this.player.setCurrentTime(this.start + 0.1)
            // this.player.play()
          }
          else if (to >= this.end) {
            // this.$log('now > end')
            // this.$q.notify('NOW > END')
            this.player.setCurrentTime(this.start + 0.1)
            // this.player.play()
            this.$emit('ended')
          }
        }
      }
    }
  },
  methods: {
    progressClick (e) {
      // this.$log('progressClick', e)
      let w = e.target.clientWidth
      let x = e.offsetX
      let now = (this.player.duration * x) / w
      // if (now > this.start && now < this.end)
      this.player.setCurrentTime(now)
    },
    async videoMove () {
      if (!this.fullscreen) return
      this.$log('videoMove')
      this.$set(this.player, 'controls', true)
      if (this.moveInterval) clearInterval(this.moveInterval)
      this.moveInterval = setTimeout(() => {
        this.$set(this.player, 'controls', false)
      }, 2500)
    },
    videoCanplay () {
      // this.$log('videoCanplay')
      this.player.setCurrentTime(this.start || 0)
      // if (this.visible && !this.mini) {
      //   // this.$q.notify('can play')
      //   // this.opacity = true
      //   this.player.setCurrentTime(this.start)
      //   this.player.play()
      // }
    },
    videoPlay () {
      // this.$log('videoPlay')
      this.$set(this.player, 'playing', true)
      // if (this.player.play) this.player.play()
    },
    videoPause () {
      // this.$log('videoPause')
      this.$set(this.player, 'playing', false)
      // if (this.player.pause) this.player.pause()
    },
    videoTimeupdate () {
      // this.$log('videoTimeupdate')
      if (!this.player.started) this.$set(this.player, 'started', true)
      if (this.$refs.kalpaVideo) {
        this.$set(this.player, 'duration', this.$refs.kalpaVideo.duration)
        this.$set(this.player, 'now', this.$refs.kalpaVideo.currentTime)
        this.now = this.$refs.kalpaVideo.currentTime
      }
    },
    async videoClick (e) {
      this.$log('videoClick')
      // TODO switch case mute/unmute play/pause
      this.muted = !this.muted
      // if (this.player.playing) this.player.pause()
      // else this.player.play()
    },
    videoFullscreenToggle () {
      this.$log('videoFullscreenToggle')
      this.fullscreen = !this.fullscreen
      this.$q.fullscreen.toggle()
    },
    playerInit () {
      if (this.source === 'KALPA') {
        this.player.now = 0
        this.player.duration = 0
        this.player.playing = false
        this.player.started = false
        this.player.setCurrentTime = (ms) => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.currentTime = ms
        }
        this.player.play = () => {
          // this.$log('PLAYER play()')
          // this.$q.notify('PLAYER PLAY')
          // this.$q.notify('player PLAY')
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.play()
        }
        this.player.pause = () => {
          // this.$log('PLAYER pause()')
          // this.$q.notify('player PAUSE')
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.pause()
        }
      } else {
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
            this.player = mediaElement
            this.player.addEventListener('playing', this.videoPlay, {passive: true})
            this.player.addEventListener('pause', this.videoPause, {passive: true})
            this.player.addEventListener('timeupdate', this.videoTimeupdate, {passive: true})
            this.player.play()
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('playerStart error')
          }
        })
      }
      this.$emit('player', this.player)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
