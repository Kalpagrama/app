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
div(:style=`{position: 'relative', maxWidth: '100%'}`).row.fit
  //- play/pause for inList
  div(
    v-if="!mini && ctx !== 'inEditor'" @click="videoToggle()"
    :style=`{position: 'absolute', zIndex: 103, opacity: 0.5}`).row.fit.items-center.justify-center
    q-btn(v-if="!playing && !mini" round flat icon="play_arrow" color="white" size="60px")
  //- muted
  q-btn(
    v-if="!mini && visible"
    round flat color="white" @click="mutedToggle()"
    :style=`{position: 'absolute', zIndex: 103, left: '8px', top: '8px', background: 'rgba(255,255,255,0.15)'}`).shadow-1
    q-icon(:name="muted ? 'volume_off' : 'volume_up'" size="18px" color="white")
  //- content
  div(
    v-if="!mini && visible && ctx !== 'inEditor'" @click="$router.push('/content/' + fragment.content.oid)"
    :style=`{
      position: 'absolute', zIndex: 103, left: '58px', top: '8px', height: '42px',
      borderRadius: '20px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.15)'}`
      ).row.items-center.q-pa-sm.cursor-pointer
    span(:style=`{userSelect: 'none', whiteSpace: 'nowrap'}`).text-white {{ fragment.content.name | cut(50) }}
  //- video wrapper
  div(:style=`{position: 'relative'}`).row.fit
    video(
      ref="ncFragmentVideo" :playsinline="true" crossorigin="Anonymous" :autoplay="false" :loop="false"
      @play="playing = true" @pause="playing = false"
      @ended="videoEnded" @timeupdate="videoTimeupdate" @seeked="videoSeeked"
      width="100%" height="100%" :muted="muted"
      :style=`{width: '100%', height: '100%', objectFit: 'contain'}`
      ).fit
      source(
        :src="ctx === 'inEditor' ? fragment.content.url : fragment.url"
        :type="ctx !== 'inEditor' ? 'video/mp4' : fragment.content.contentSource === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'")
  //- progress
  div(
    v-if="now && !mini"
    :style=`{position: 'absolute', bottom: '0px', zIndex: 105, height: '28px'}`).row.full-width.q-px-md
    //- progress width
    div(:style=`{position: 'relative', height: '28px'}` @click="progressClick").row.full-width.cursor-pointer
      div(:style=`{position: 'absolute', top: '10px', height: '4px', pointerEvents: 'none', background: 'rgba(255,255,255,0.8)',
        borderRadius: '4px', overflow: 'hidden'}`).row.full-width
      //- progress bar
      div(:style=`{position: 'absolute', top: '10px', height: '4px', width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden'}`
        ).row.bg-green.q-px-xs
    //- progress now/duration
    small(:style=`{position: 'absolute', zIndex: 105, top: '-10px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)'}`
      ).q-px-sm.text-white {{ $time(now) }} / {{ $time(player.duration) }}
</template>

<script>
export default {
  name: 'ncFragmentVideo',
  props: ['ctx', 'fragment', 'mini', 'visible'],
  data () {
    return {
      now: undefined,
      player: null,
      playing: false,
      muted: true
    }
  },
  computed: {
  },
  methods: {
    mutedToggle () {
      this.$log('mutedToggle')
      if (this.ctx === 'inEditor') {
        this.player.setMuted(!this.muted)
        this.muted = !this.muted
      } else {
        this.player.setMuted(!this.muted)
      }
      this.$emit('muted', !this.muted)
    },
    async play () {
      this.$log('play')
      if (this.player) {
        this.player.play()
        await this.$wait(100)
        this.player.setMuted(false)
      }
    },
    pause () {
      this.$log('pause')
      if (this.player) this.player.pause()
    },
    progressClick (e) {
      this.$log('progressClick', this.player.duration)
      let w = e.target.clientWidth
      let x = e.offsetX
      let now = (this.player.duration * x) / w
      this.$log('w,x,now', w, x, now)
      this.player.setCurrentTime(now)
    },
    videoToggle () {
      if (this.playing) this.pause()
      else this.play()
      this.playing = !this.playing
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      if (this.ctx === 'inEditor') {
        this.now = this.player.currentTime
      } else {
        this.now = this.$refs.ncFragmentVideo.currentTime
        this.player.currentTime = this.$refs.ncFragmentVideo.currentTime
        this.player.duration = this.$refs.ncFragmentVideo.duration
      }
    },
    videoEnded (e) {
      this.$log('videoEnded', e)
      this.$emit('ended')
    },
    videoSeeked (e) {
      this.$log('videoSeeked', e)
    },
    playerStart () {
      this.$log('playerStart')
      let me = new window.MediaElementPlayer(this.$refs.ncFragmentVideo, {
        loop: true,
        autoplay: false,
        controls: false,
        features: ['playpause'],
        enableAutosize: true,
        stretching: 'fill',
        pauseOtherPlayers: false,
        ignorePauseOtherPlayersOption: false,
        clickToPlayPause: true,
        success: async (mediaElement, originalNode, instance) => {
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.videoTimeupdate)
          this.player.addEventListener('seeked', this.videoSeeked)
          // this.player.play()
        },
        error: async (mediaElement, originalNode, instance) => {
          this.$log('playerStart error')
          this.$log('playerStart mediaElement', mediaElement)
          this.$log('playerStart originalNode', originalNode)
          this.$log('playerStart instance', instance)
          this.$q.notify('playerStart error!!!')
        }
      })
    },
    playerStartNative () {
      this.$log('playerStartNative')
      this.player = {}
      this.player.play = async () => {
        this.$log('playerNative: play')
        this.$refs.ncFragmentVideo.play()
      }
      this.player.pause = async () => {
        this.$log('playerNative: pause')
        this.$refs.ncFragmentVideo.pause()
      }
      this.player.setCurrentTime = (ms) => {
        this.$log('playerNative: setCurrentTime', ms)
        this.$refs.ncFragmentVideo.currentTime = ms
      }
      this.player.setMuted = (muted) => {
        this.$log('playerNative: setMuted', muted)
        this.muted = muted
      }
      this.player.currentTime = this.$refs.ncFragmentVideo.currentTime
      this.player.duration = this.$refs.ncFragmentVideo.duration
      this.player.now = this.$refs.ncFragmentVideo.currentTime
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.ctx === 'inEditor') this.playerStart()
    else this.playerStartNative()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.ctx === 'inEditor') {
      this.player.removeEventListener('timeupdate', this.videoTimeupdate)
      this.player.removeEventListener('seeked', this.videoSeeked)
    }
  }
}
</script>
