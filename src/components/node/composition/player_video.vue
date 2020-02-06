<template lang="pug">
.row.fit.bg-black
  div(:style=`{position: 'relative'}`).row.fit
    video(
      ref="kalpaVideo"
      playsinline autoplay
      @click="videoClick" @play="videoPlay" @pause="videoPause" @timeupdate="videoTimeupdate" @ended="videoEnded"
      :style=`{width: '100%', height: '100%', objectFit: 'contain'}`)
      source(
        :src="url" type="video/mp4")
    //- progress
    div(
      v-if="true"
      v-show="true"
      :style=`{
        position: 'absolute', bottom: '16px', left: 0, zIndex: 1000}`
      ).row.full-width.items-start.content-start
      //- pregress wrapper
      .row.full-width.items-start.content-start.q-px-md
        //- progress actions
        div(:style=`{height: '44px'}`).row.full-width
          //- play/pause
          div(
            :style=`{width: '44px'}`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              round flat color="green" @click="videoClick"
              :icon="player.playing === true ? 'pause' : 'play_arrow'")
          .col
            .row.fit.items-center.content-center
              span(
                :style=`{pointerEvents: 'none'}`
                ).text-white {{$time(now)+' / '+$time(player.duration)}}
          //- fullscreen
          div(
            :style=`{width: '44px'}`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              round flat color="green" @click="$q.fullscreen.toggle()"
              :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'")
        //- progress bar & time
        div(
          :style=`{height: progressHeight+'px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-grey-10
          //- progress
          .col.full-height
            div(
              @click="progressClick"
              :style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`
              ).row.fit.bg-grey-9.cursor-pointer
              //- //- progress time
              //- span(
              //-   :style=`{position: 'absolute', zIndex: 2000, top: '9px', left: '10px', zIndex: 200, pointerEvents: 'none'}`
              //-   ).text-white {{$time(now)+' / '+$time(player.duration)}}
              //- progress %
              div(:style=`{position: 'absolute', zIndex: 100, left: 0, width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRight: '2px solid #4caf50'}`).row.full-height.bg-grey-7
      slot(name="layerEditor" :now="now" :player="player" :progressHeight="progressHeight")
</template>

<script>
export default {
  name: 'playerVideo',
  props: ['url', 'source', 'start', 'end'],
  data () {
    return {
      now: 0,
      player: {},
      moveInterval: null,
      progressHeight: 10
      // start: 3,
      // end: 30
    }
  },
  watch: {
    now: {
      handler (to, from) {
        // this.$log('now CHANGED', to)
        // if (this.start) {
        //   if (to < this.start) {
        //     this.player.setCurrentTime(this.start)
        //   }
        //   if (to > this.end) {
        //     this.player.setCurrentTime(this.start)
        //     this.$emit('ended')
        //   }
        // }
      }
    }
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick', e)
      let w = e.target.clientWidth
      let x = e.offsetX
      let now = (this.player.duration * x) / w
      this.player.setCurrentTime(now)
    },
    async videoMove () {
      // this.$log('videoMove')
      this.$set(this.player, 'controls', true)
      if (this.moveInterval) clearInterval(this.moveInterval)
      this.moveInterval = setTimeout(() => {
        this.$set(this.player, 'controls', false)
      }, 2500)
    },
    videoPlay () {
      this.$log('videoPlay')
      this.$set(this.player, 'playing', true)
    },
    videoPause () {
      this.$log('videoPause')
      this.$set(this.player, 'playing', false)
    },
    videoTimeupdate () {
      // this.$log('videoTimeupdate')
      if (!this.player.started) this.$set(this.player, 'started', true)
      this.$set(this.player, 'duration', this.$refs.kalpaVideo.duration)
      this.$set(this.player, 'now', this.$refs.kalpaVideo.currentTime)
      this.now = this.$refs.kalpaVideo.currentTime
    },
    videoEnded (e) {
      this.$log('videoEnded', e)
      this.$emit('ended')
    },
    async videoClick (e) {
      this.$log('videoClick', e)
      // this.$q.notify('Video click!')
      if (this.player.playing) this.$refs.kalpaVideo.pause()
      else this.$refs.kalpaVideo.play()
    },
    playerInit () {
      if (this.source === 'KALPA') {
        this.player.now = 0
        this.player.duration = 0
        this.player.playing = false
        this.player.started = false
        this.player.setCurrentTime = (ms) => {
          this.$refs.kalpaVideo.currentTime = ms
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
  mounted () {
    this.$log('mounted')
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
