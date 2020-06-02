<style lang="sass">
// iframe[id$="_youtube_iframe"]
//   width: 100%
//   height: 100%
//   border-radius: 10px
//   overflow: hidden
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  z-index: 100
  border-radius: 10px
  overflow: hidden
  pointer-events: none
@media (min-width: 600px)
  iframe[id$="_youtube_iframe"]
    width: 1000%
    height: 1000%
    min-width: 1000%
    min-height: 1000%
    z-index: 100
    border-radius: 10px
    overflow: hidden
    transform: scale(0.1)
    transform-origin: top left
    pointer-events: none
.mejs__overlay-button
  display: none
  // opacity: 0.2
  // transform: scale(2)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    opacity: opacity,
  }`).column.fit
  video-controller(v-bind="$props" :player="player" :meta="meta")
  slot(name="header" :player="player" :meta="meta")
  div(
    :class=`{
      'full-height': ctx !== 'workspace'
    }`
    :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-50
    slot(name="video" :player="player" :meta="meta")
    //- kalpa-debug(:style=`{position: 'absolute', zIndex: 1000, top: '0px',}` :options=`{ctx,mode,now,duration,timeupdateStop,layerId,layerStart,layerEnd,videoMuted}`)
    q-spinner(
      v-if="ctx === 'workspace' && !loaded"
      size="50px" color="green"
      :style=`{position: 'absolute', top: 'calc(50% - 25px)', left: 'calc(50% - 25px)'}`)
    video(
      ref="videoRef"
      :src="videoSrc" :type="videoType"
      :playsinline="true"
      :loop="true"
      :controls="false"
      :muted="videoMuted"
      :autoplay="videoAutoplay"
      @click="playing ? player.pause() : player.play()"
      @loadeddata="videoLoadeddata" @play="videoPlay" @pause="videoPause" @ended="$emit('ended')"
      @timeupdate="videoTimeupdate"
      :class=`{
        'full-height': ctx !== 'workspace'
      }`
      :style=`{
        position: 'relative', width: '100%', objectFit: 'contain', borderRadius: '0px', overflow: 'hidden',
      }`)
    video-progress(v-bind="$props" :player="player" :meta="meta")
  .col.full-width
    slot(name="editor" :player="player" :meta="meta")
  slot(name="footer")
</template>

<script>
import videoProgress from './video_progress'
import videoController from './video_controller'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'composition-playerVideo',
  components: {videoProgress, videoController},
  props: ['ctx', 'preview', 'composition', 'visible', 'active', 'mini'],
  data () {
    return {
      mode: 'content', // content, layer, composition
      layerId: null,
      layerContent: null,
      now: 0,
      duration: 0,
      player: null,
      playing: false,
      loaded: false,
      muted: false,
      timeupdateStop: false
    }
  },
  computed: {
    opacity () {
      if (this.ctx === 'workspace') return 1
      else {
        if (this.now < this.layerStart) return 0
        else return 1
      }
    },
    meta () {
      return {
        mode: this.mode,
        now: this.now,
        duration: this.duration,
        playing: this.playing,
        loaded: this.loaded,
        layer: this.layer,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        layerId: this.layerId,
        layers: this.composition.layers,
        content: this.layerContent,
        timeupdateStop: this.timeupdateStop
      }
    },
    layer () {
      let layer = this.composition.layers.find(l => l.id === this.layerId)
      if (layer) return layer
      else return null
    },
    layerStart () {
      if (this.ctx === 'workspace') return this?.layer?.figuresAbsolute[0].t
      else return this?.layer?.figuresRelative[0].t
    },
    layerEnd () {
      if (this.ctx === 'workspace') return this?.layer?.figuresAbsolute[1].t
      else return this?.layer?.figuresRelative[1].t
    },
    videoSrc () {
      // return this.ctx === 'workspace' ? this.layerContent?.url : this.layer?.url
      // #t=10,20
      if (this.ctx === 'workspace') {
        return this.layerContent?.url
      }
      else {
        return `${this.layer?.url}#t=${this.layerStart},${this.layerEnd}`
      }
    },
    videoType () {
      return this.ctx === 'workspace' ? 'video/youtube' : 'video/mp4'
    },
    videoMuted () {
      if (this.muted) {
        return this.muted
      }
      else {
        // if (this.$q.screen.xs) {
        //   return true
        // }
        if (this.$q.platform.is.ios) {
          return true
        }
        else {
          // if in localstorage i need sound
          return false
        }
      }
    },
    videoAutoplay () {
      return true
    }
  },
  watch: {
    composition: {
      immediate: true,
      async handler (to, from) {
        this.$log('composition CHANGED', to)
        if (to.layers.length > 0) {
          if (!this.layerId) this.layerId = to.layers[0].id
          if (!this.layerContent) this.layerContent = await this.$rxdb.get(RxCollectionEnum.OBJ, to.layers[0].contentOid)
          // this.$nextTick(() => {
          //   if (!this.player) {
          //     alert('playerInit')
          //     this.playerInit()
          //   }
          // })
        }
        this.$log('to.contentOid', to.contentOid)
        if (to.contentOid) this.layerContent = await this.$rxdb.get(RxCollectionEnum.OBJ, to.contentOid)
      }
    },
    layer: {
      immediate: false,
      async handler (to, from) {
        this.$log('layer CHANGED', to)
        if (to) {
          this.layerContent = await this.$rxdb.get(RxCollectionEnum.OBJ, to.contentOid)
        }
      }
    },
    layerContent: {
      handler (to, from) {
        this.$log('layerContent CHANGED', to)
        if (to) {
          this.$nextTick(() => {
            if (!this.player) this.playerInit()
          })
        }
      }
    }
  },
  methods: {
    playerInit () {
      this.$log('playerInit START', this.ctx)
      const videoRef = this.$refs.videoRef
      if (this.ctx === 'workspace') {
        this.$log('player WORKSPACE start', this.videoSrc)
        // alert('player WORKSPACE start')
        let me = new window.MediaElementPlayer(videoRef, {
          loop: true,
          autoplay: true,
          controls: false,
          features: [],
          // enableAutosize: true,
          stretching: 'fill',
          pauseOtherPlayers: true,
          clickToPlayPause: true,
          // plugins: ['youtube'],
          success: async (mediaElement, originalNode, instance) => {
            this.$log('player WORKSPACE done')
            this.player = mediaElement
            this.player.addEventListener('play', this.videoPlay)
            this.player.addEventListener('pause', this.videoPause)
            this.player.addEventListener('loadeddata', this.videoLoadeddata)
            // this.player.addEventListener('timeupdate', this.videoTimeupdate)
            // this.videoUpdate()
            // this.videoPlay()
            // this.player.play()
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('player WORKSPACE error')
          }
        })
      }
      else {
        this.$log('player KALPA start', this.videoSrc)
        // alert('player KALPA start')
        this.player = {}
        this.player.setCurrentTime = async (ms) => {
          videoRef.currentTime = ms
        }
        this.player.play = () => {
          videoRef.play()
        }
        this.player.pause = () => {
          videoRef.pause()
        }
        this.$log('player KALPA done')
        // this.videoUpdate()
      }
      // set player defaults for all the players
      this.player.update = (to) => {
        this.videoTimeupdate(null, to)
      }
      this.player.meta = ([key, val]) => {
        this.$log('player.meta()', key, val)
        this[key] = val
      }
      if (this.ctx === 'workspace') {
        this.player.play()
      }
      this.$log('playerInit done')
    },
    videoLoadeddata (e) {
      // this.$log('videoLoadeddata', e)
      this.loaded = true
      if (this.ctx === 'workspace') {
        this.duration = this.player.duration
      }
      else {
        this.duration = this.$refs.videoRef.duration
      }
    },
    videoPlay (e) {
      this.$log('videoPlay', e)
      this.playing = true
      if (this.ctx === 'workspace') {
        if (this.playingInterval) clearInterval(this.playingInterval)
        this.playingInterval = setInterval(this.videoTimeupdate, 50)
      }
    },
    videoPause (e) {
      this.$log('videoPause', e)
      this.playing = false
      if (this.ctx === 'workspace') {
        clearInterval(this.playingInterval)
        this.playingInterval = null
      }
    },
    videoTimeupdate (e, t) {
      // this.$log('videoTimeupdate')
      // TODO: prevent to emit event on
      if (this.ctx === 'workspace') {
        this.now = t || this.player.currentTime
      }
      else {
        if (t) this.now = t
        else {
          if (this.$refs.videoRef) this.now = this.$refs.videoRef.currentTime
        }
        // this.now = t || this.$refs.videoRef.currentTime
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.ctx === 'workspace') {
      if (this.playingInterval) clearInterval(this.playingInterval)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.ctx === 'workspace') {
      if (this.playingInterval) clearInterval(this.playingInterval)
      if (!this.player) return
      this.player.removeEventListener('play', this.videoPlay)
      this.player.removeEventListener('pause', this.videoPause)
      this.player.removeEventListener('loadeddata', this.videoLoadeddata)
      // this.player.removeEventListener('timeupdate', this.videoTimeupdate)
    }
  }
}
</script>
