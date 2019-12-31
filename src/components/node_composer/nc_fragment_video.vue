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
  //- div(
  //-   v-if="!mini"
  //-   :style=`{position: 'absolute', top: '50%', zIndex: 2000, opacity: 0.5}`).row.items-center.justify-center.bg-green
  //-   span(@click="$emit('mini')").text-white.text-bold {{ now }}
  //- play/pause for inList
  div(
    v-if="!mini && ctx !== 'inEditor'" ref="playPause" @click="videoToggle()"
    :style=`{position: 'absolute', zIndex: 103, opacity: 0.5}`).row.fit.items-center.justify-center
    q-btn(v-if="!playing && !mini" round flat icon="play_arrow" color="white" size="60px")
  //- muted
  q-btn(
    v-if="!mini"
    round flat color="white" @click="player.setMuted(!muted)"
    :style=`{position: 'absolute', zIndex: 103, left: '16px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.15)'}`).shadow-1
    q-icon(:name="muted ? 'volume_off' : 'volume_up'" size="18px" color="white")
  //- content
  div(
    v-if="!mini && visible && ctx !== 'inEditor'" @click="$router.push('/content/' + fragment.content.oid)"
    :style=`{
      position: 'absolute', zIndex: 103, left: '8px', top: '8px', height: '42px',
      borderRadius: '10px', overflow: 'hidden',
      background: 'rgba(255,255,255,0.15)'}`
      ).row.items-center.q-pa-sm.cursor-pointer
    span(:style=`{userSelect: 'none', whiteSpace: 'nowrap'}`).text-white {{ fragment.content.name | cut(40) }}
  //- video wrapper
  div(:style=`{position: 'relative'}`).row.fit
    video(
      ref="ncFragmentVideo" :playsinline="true" crossorigin="Anonymous" :autoplay="false" :loop="true" preload="auto"
      @play="playing = true" @pause="playing = false"
      @ended="videoEnded" @timeupdate="videoTimeupdate" @seeked="videoSeeked"
      width="100%" height="100%" muted="true"
      :style=`{width: '100%', height: '100%', objectFit: 'contain'}`
      ).fit
      source(
        :src="ctx === 'inEditor' ? fragment.content.url : fragment.url"
        :type="ctx !== 'inEditor' ? 'video/mp4' : fragment.content.contentSource === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'")
  //- progress
  div(
    v-if="now"
    :style=`{position: 'absolute', bottom: '0px', zIndex: 105, height: '28px'}`).row.full-width.q-px-md
    //- progress width
    div(
      v-show="!mini"
      :style=`{position: 'relative', height: '28px'}` @click="progressClick").row.full-width.cursor-pointer
      div(:style=`{position: 'absolute', top: '10px', height: '4px', pointerEvents: 'none', background: 'rgba(255,255,255,0.8)',
        borderRadius: '4px', overflow: 'hidden'}`).row.full-width
      //- progress bar
      div(:style=`{position: 'absolute', top: '10px', height: '4px', width: (now/player.duration)*100+'%', pointerEvents: 'none', borderRadius: '4px', overflow: 'hidden'}`
        ).row.bg-green.q-px-xs
    //- progress now/duration
    small(
      v-show="!mini"
      :style=`{position: 'absolute', zIndex: 105, top: '-10px', borderRadius: '4px', background: 'rgba(0,0,0,0.4)'}`
      ).q-px-sm.text-white {{ $time(now) }} / {{ $time(player.duration) }}
</template>

<script>
export default {
  name: 'ncFragmentVideo',
  props: ['ctx', 'fragment', 'mini', 'visible', 'index'],
  data () {
    return {
      now: undefined,
      nowMini: undefined,
      player: null,
      playing: false,
      muted: true
    }
  },
  computed: {
  },
  watch: {
    visible: {
      immediate: true,
      handler (to, from) {
        this.$log('visible CHANGED', to)
        if (to && !this.mini) {
          // this.play()
        }
      }
    }
  },
  methods: {
    async play () {
      this.$log('play')
      // this.$q.notify('PLAY' + localStorage.getItem('kmute'))
      if (this.player) this.player.play()
      if (localStorage.getItem('kmute') === 'yes') this.player.setMuted(true)
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
      if (this.now !== 0 && this.now === this.player.currentTime) return
      this.$log('videoTimeupdate', e)
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
    playerInit () {
      this.$log('playerInit')
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
          // this.$log('playerInit done')
          this.player = mediaElement
          this.player.addEventListener('timeupdate', this.videoTimeupdate)
          this.player.addEventListener('seeked', this.videoSeeked)
          // this.player.play()
          // this.player.setMuted(false)
          // this.muted = false
          // this.$emit('ready')
          // this.$q.notify('ready')
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
    async playerInitNative () {
      this.$log('playerInitNative start')
      this.player = {}
      this.player.play = async () => {
        return new Promise((resolve, reject) => {
          // this.$log('playerNative: play')
          // this.$refs.ncFragmentVideo.play()
          this.$refs.ncFragmentVideo.play().then(() => resolve())
          // resolve()
        })
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
        if (muted) localStorage.setItem('kmute', 'yes')
        else localStorage.removeItem('kmute')
        this.muted = muted
        this.$refs.ncFragmentVideo.muted = muted
      }
      this.player.currentTime = this.$refs.ncFragmentVideo.currentTime
      this.player.duration = this.$refs.ncFragmentVideo.duration
      this.player.now = this.$refs.ncFragmentVideo.currentTime
      // await this.$wait(200)
      this.$emit('ready')
      // this.$log('playerInit done')
    }
  },
  async mounted () {
    this.$log('mounted')
    // if (this.visible) this.$q.notify('MOUNTED' + this.index)
    if (this.$q.screen.width > 600) {
      // this.$q.notify('IS DESKTOP')
      this.$refs.ncFragmentVideo.muted = false
      this.muted = false
    }
    if (this.ctx === 'inEditor') this.playerInit()
    else this.playerInitNative()
    // this.player.setCurrentTime(0)
    // await this.player.play()
    // this.player.pause()
    this.$refs.ncFragmentVideo.load()
    // this.player.play()
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    if (this.ctx === 'inEditor') {
      this.player.removeEventListener('timeupdate', this.videoTimeupdate)
      this.player.removeEventListener('seeked', this.videoSeeked)
      this.player.remove()
    }
  }
}
</script>
