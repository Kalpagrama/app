<template lang="pug">
div(
  @mousemove="videoMove"
  :style=`{position: 'relative'}`
  ).column.fit.items-center.content-center.justify-center.bg-black
  //- video debug
  div(:style=`{position: 'absolute', left: '16px', top: '76px', width: '100%', maxWidth: 'calc(100% - 32px)', borderRadius: '10px', color: 'white', fontSize: '10px'}`
    ).row.bg-green.q-pa-sm
    small.full-width now: {{now}}
    small.full-width player: {{player}}
  //- video wrapper
  .col.full-width
    video(
      ref="contentVideo" @click="videoClick"
      @play="videoPlay" @pause="videoPause" @timeupdate="videoTimeupdate"
      :src="content.url" type="video/mp4" autoplay loop
      :style=`{
        width: '100%',
        height: '100%',
        objectFit: 'contain'
      }`)
  //- nodes
  //- timeline 1
  div(
    v-if="true"
    v-show="player.playing ? player.controls : true"
    :style=`{
      position: 'absolute', bottom: '16px', left: 0, zIndex: 1000,
      height: '44px'}`
    ).row.full-width.q-px-md
    div(
      :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.bg-grey-10
      //- play/pause
      div(
        :style=`{width: '44px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat color="green" @click="videoClick"
          :icon="player.playing === true ? 'pause' : 'play_arrow'")
      //- progress
      .col.full-height
        div(
          @click="progressClick"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
          ).row.fit.bg-grey-9.cursor-pointer
          //- progress time
          span(
            :style=`{position: 'absolute', top: '12px', left: '10px', zIndex: 200, pointerEvents: 'none'}`
            ).text-white {{$time(now)+' / '+$time(player.duration)}}
          //- progress %
          div(:style=`{position: 'absolute', zIndex: 100, left: 0, width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRight: '2px solid #4caf50'}`).row.full-height.bg-grey-7
      //- fullscreen
      div(
        :style=`{width: '44px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round flat color="green" @click="$q.fullscreen.toggle()"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'")
  //- timeline 2: mini
  div(
    v-if="false"
    v-show="player.playing ? player.controls : true"
    :style=`{
      position: 'absolute',
      bottom: 16+extractorHeight+'px',
      left: 0, zIndex: 1000,
      height: '10px'}`
    ).row.full-width.q-px-md
    div(
      :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.fit.bg-grey-10
      div(
        @click="progressClick"
        :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
        ).row.fit.bg-grey-9.cursor-pointer
        //- progress %
        div(:style=`{position: 'absolute', zIndex: 100, left: 0, width: (now/player.duration)*100+'%', pointerEvents: 'none'}`).row.full-height.bg-green
      //- fullscreen
</template>

<script>
import contentVideoExtractor from './content_video_extractor'

export default {
  name: 'contentVideo',
  components: {contentVideoExtractor},
  props: ['node', 'ctx', 'content'],
  data () {
    return {
      now: 0,
      player: {},
      moveInterval: null,
      extractorOpened: false,
      extractorHeight: 0,
      metaOpened: false,
      metaWidth: 0
    }
  },
  watch: {
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
      this.$set(this.player, 'duration', this.$refs.contentVideo.duration)
      this.$set(this.player, 'now', this.$refs.contentVideo.currentTime)
      this.now = this.$refs.contentVideo.currentTime
    },
    async videoClick (e) {
      this.$log('videoClick', e)
      // this.$q.notify('Video click!')
      if (this.player.playing) this.$refs.contentVideo.pause()
      else this.$refs.contentVideo.play()
    },
    playerInit () {
      if (this.content.contentSource === 'KALPA') {
        // TODO: if content.contentSource === KALPA
        this.player.now = 0
        this.player.duration = 0
        this.player.playing = false
        this.player.started = false
        this.player.setCurrentTime = (ms) => {
          this.$refs.contentVideo.currentTime = ms
        }
      } else {
        let me = new window.MediaElementPlayer(this.$refs.contentVideo, {
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
    this.$log('mounted', this.content)
    this.playerInit()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.content.contentSource !== 'KALPA') {
      this.player.removeEventListener('playing', this.videoPlay)
      this.player.removeEventListener('pause', this.videoPause)
      this.player.removeEventListener('timeupdate', this.videoTimeupdate)
      this.player.remove()
    }
  }
}
</script>
