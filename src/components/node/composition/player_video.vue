<style lang="stylus">
iframe {
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  max-width: 100%;
  max-height: 100%;
  z-index: 100;
}
.mejs__overlay-button {
  display: none;
}
</style>

<template lang="pug">
div(
  :class=`{'bg-black': videoGood}`
  :style=`{position: 'relative'}`
  ).column.fit.items-start.content-start
  //- opacity: videoGood ? 1 : 0
  //- div(:style=`{position: 'absolute', zIndex: 100000, top: '50px', left: '50px', width: '50px', height: '50px'}`).row
  //- debug
  div(
    v-if="!mini && $store.state.ui.debug"
    :style=`{
      position: 'absolute', width: 'calc(100% - 20px)', left: '6px', top: '4px',
      pointerEvents: 'none', userSelect: 'none', transform: 'translate3d(0,0,0)',
      zIndex: 10000, borderRadius: '10px', color: 'white', opacity: 0.5}`).row.q-pa-sm.bg-green
    small.full-width visible/active/mini: {{visible}}/{{active}}/{{mini}}
    small.full-width now/duration: {{now}}/{{duration}}
    small.full-width ctx/mode: {{ctx}}/{{mode}}
    small.full-width start/end: {{layerStart}}/{{layerEnd}}
    small.full-width layerIndex: {{layerIndex}}
    small.full-width layerIndexPlay: {{layerIndexPlay}}
  //- video container
  div(:style=`{position: 'relative', overflow: 'hidden'}`).col.full-width
    //- layer name
    //- span(
    //-   v-if="videoGood && !mini && layer.spheres.length > 0" @click="layerNameClick()"
    //-   :style=`{
    //-     position: 'absolute', zIndex: 20000, top: '6px', left: '6px',
    //-     borderRadius: '10px', overflow: 'hidden',
    //-     color: 'white', background: 'rgba(0,0,0,0.3)'}`
    //-   ).q-pa-sm {{ layer.spheres[0].name | cut(50) }}
    //- video actions, volume, progress
    q-btn(
      v-if="true"
      v-show="!mini"
      round flat @click="player.mutedToggle()"
      :color="muted ? 'grey-6' : 'white'"
      :icon="muted ? 'volume_off' : 'volume_up'"
      :style=`{position: 'absolute', zIndex: 20000, right: '10px', top: 'calc(50% - 20px)', background: 'rgba(0,0,0,0.2)', transform: 'translate3d(0,0,0)'}`)
    //- video forward
    div(
      v-on:dblclick="videoForward(0)" @click="forwarding === 'left' ? videoForward(0) : videoClick()"
      v-ripple=`forwarding === 'left' ? {color: 'white'} : false`
      :style=`{position: 'absolute', zIndex: 20, top: '0px', width: '33%', left: '0px',
        'border-top-right-radius': '100%', 'border-bottom-right-radius': '100%',
        background: forwarding === 'left' ? 'rgba(255,255,255,0.3)' : 'none'}`).row.full-height.items-center.content-center.justify-center.q-px-md
        q-btn(
          v-show="forwarding === 'left'"
          round flat size="md" color="white" icon="keyboard_arrow_left"
          :style=`{pointerEvents: 'none'}`)
        span(
          v-show="forwarding === 'left'"
          :style=`{userSelect: 'none', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).text-white.q-pa-sm {{ $time(forwardingCount) }}
    //- video forward
    div(
      v-on:dblclick="videoForward(1)" @click="forwarding === 'right' ? videoForward(1) : videoClick()"
      v-ripple=`forwarding === 'right' ? {color: 'white'} : false`
      :style=`{position: 'absolute', zIndex: 20, top: '0px', width: '33%', right: '0px',
        'border-top-left-radius': '100%', 'border-bottom-left-radius': '100%',
        background: forwarding === 'right' ? 'rgba(255,255,255,0.3)' : 'none'}`).row.full-height.items-center.content-center.justify-center.q-px-md
        q-btn(
          v-show="forwarding === 'right'"
          round flat size="lg" color="white"  icon="keyboard_arrow_right"
          :style=`{pointerEvents: 'none'}`)
        span(
          v-show="forwarding === 'right'"
          :style=`{userSelect: 'none', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).text-white.q-pa-sm {{ $time(forwardingCount) }}
    //- video wrapper
    div(:style=`{position: 'absolute', zIndex: 10, top: '0px', height: 'calc(100% + 0px)',
      opacity: ctx === 'list' ? videoGood ? 1 : 0 : 1}`).row.full-width
      //- preload="auto"
      video(
        ref="kalpaVideo"
        :src="contentUrl" :type="contentSource === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'"
        playsinline :loop="true" :autoplay="autoplay" :muted="mutedComputed" :controls="false"
        @loadeddata="videoLoadeddata" @click="videoClick" @play="videoPlay" @pause="videoPause" @ended="$emit('ended')"
        @timeupdate="videoUpdate"
        :style=`{
          position: 'relative', width: '100%', height: '100%', objectFit: 'contain'
        }`)
    //- video tools
    //- progress
    player-video-progress(
      :ctx="ctx" :player="player" :meta="meta" @meta="onMeta"
      :start="layerStart || 0" :end="layerEnd || duration"
      :style=`{position: 'absolute', bottom: '14px', left: '0px', zIndex: 20000, transform: 'translate3d(0,0,0)'}`)
    //- red
    //- div(:style=`{position: 'absolute', right: '0px', top: '50px', width: '50px', height: '50px'}`).row.bg-red
  slot(name="editor" :meta="meta" :player="player")
</template>

<script>
import {throttle} from 'quasar'
import playerVideoProgress from './player_video_progress'

const sendTouchEvent = (x, y, element, eventType) => {
  const touchObj = new Touch({
    identifier: Date.now(),
    target: element,
    clientX: x,
    clientY: y,
    radiusX: 2.5,
    radiusY: 2.5,
    rotationAngle: 10,
    force: 0.5,
  })
  const touchEvent = new TouchEvent(eventType, {
    cancelable: true,
    bubbles: true,
    touches: [touchObj],
    targetTouches: [],
    changedTouches: [touchObj],
    shiftKey: true,
  })
  element.dispatchEvent(touchEvent)
}

export default {
  name: 'playerVideo',
  props: ['ctx', 'composition', 'visible', 'active', 'mini'],
  components: {playerVideoProgress},
  data () {
    return {
      now: 0,
      nowPause: false,
      duration: 0,
      player: null,
      playing: false,
      muted: true,
      autoplay: true,
      fullscreen: false,
      intervalUpdate: null,
      intervalMove: null,
      progressHeight: 20,
      mode: 'play',
      layerIndex: 0,
      layerIndexPlay: -1,
      editing: false,
      forwarding: null,
      forwardingInterval: null,
      forwardingCount: 0
    }
  },
  computed: {
    meta () {
      return {
        now: this.now,
        duration: this.duration,
        playing: this.playing,
        muted: this.muted,
        layerIndex: this.layerIndex,
        layerIndexPlay: this.layerIndexPlay,
        mode: this.mode,
        progressHeight: this.progressHeight,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        editing: this.editing
      }
    },
    layers () {
      return this.composition.layers
    },
    layer () {
      return this.layers[this.layerIndex]
    },
    layerStart () {
      if (this.ctx === 'list' || this.ctx === 'rubick') {
        return this.layer.figuresRelative[0] ? this.layer.figuresRelative[0].t : false
      }
      else {
        return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
      }
      // if (this.ctx === 'workspace' || this.ctx === 'editor') {
      //   return this.layer.figuresAbsolute[0] ? this.layer.figuresAbsolute[0].t : false
      // }
      // else {
      //   return this.layer.figuresRelative[0] ? this.layer.figuresRelative[0].t : false
      // }
    },
    layerEnd () {
      if (this.ctx === 'list' || this.ctx === 'rubick') {
        return this.layer.figuresRelative[1] ? this.layer.figuresRelative[1].t : false
      }
      else {
        return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
      }
      // if (this.ctx === 'workspace' || this.ctx === 'editor') {
      //   return this.layer.figuresAbsolute[1] ? this.layer.figuresAbsolute[1].t : false
      // }
      // else {
      //   return this.layer.figuresRelative[1] ? this.layer.figuresRelative[1].t : false
      // }
    },
    content () {
      return this.layer.content
    },
    contentSource () {
      // return this.content ? this.content.contentSource : false
      if (this.ctx === 'list' || this.ctx === 'rubick') {
        return 'KALPA'
      }
      else {
        if (this.content.contentSource === 'YOUTUBE') return 'YOUTUBE'
        else return 'KALPA'
      }
    },
    contentUrl () {
      if (this.ctx === 'list' || this.ctx === 'rubick') {
        return this.layer.url
      }
      else {
        return this.content.url
      }
      // if (this.content.contentSource === 'YOUTUBE') {
      //   return this.content.url
      // }
      // else if (this.content.contentSource === 'KALPA') {
      //   if (this.ctx === 'editor' || this.ctx === 'workspace') return this.content.url
      //   else return this.layer.url
      // }
      // else {
      //   return false
      // }
    },
    videoGood () {
      if (this.layerEnd && this.layerStart) {
        return this.now > this.layerStart && this.now < this.layerEnd
      }
      else {
        return true
      }
    },
    progressShow () {
      if (this.mini) return false
      else {
        if (this.ctx === 'workspace' || this.ctx === 'editor') return true
        else return false
      }
    },
    mutedComputed () {
      if (this.ctx === 'contentEditor') {
        return false
      }
      else {
        return this.muted
      }
    }
  },
  watch: {
    // videoGood: {
    //   async handler (to, from) {
    //     this.$log('videoGood CHANGED', to)
    //     this.actionsShow = false
    //     await this.$wait(500)
    //     this.actionsShow = true
    //     // this.player.mutedToggle()
    //     // this.$q.notify('videoGood CHANGED: ' + to)
    //     // this.$refs.kalpaVideo.click()
    //     // this.player.play()
    //     // let r = this.$refs.kalpaVideo
    //     // sendTouchEvent(150, 150, r, 'touchstart')
    //     // sendTouchEvent(220, 200, r, 'touchmove')
    //     // sendTouchEvent(220, 200, r, 'touchend')
    //     // sendTouchEvent()
    //     // this.$refs.kalpaVideo.click()
    //     // this.autoplay = false
    //     // var evt = document.createEvent('MouseEvents')
    //     // evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    //     // r.dispatchEvent(evt)
    //   }
    // },
    contentSource: {
      immediate: false,
      handler (to, from) {
        this.$log('contentSource CHANGED', to)
        if (to) this.playerInit()
      }
    },
    visible: {
      immediate: true,
      handler (to, from) {
        this.$log('visible CHANGED', to)
        if (this.layerStart && this.player) this.player.setCurrentTime(this.layerStart)
        // if (to) {
        //   this.$q.notify('visible!!!')
        //   // this.player.play()
        //   if (this.layerStart) this.player.setCurrentTime(this.layerStart)
        // }
        // else this.player.pause()
      }
    },
    active: {
      immediate: false,
      handler (to, from) {
        this.$log('active CHANGED', to)
        if (to) this.player.play()
        else this.player.pause()
      }
    },
    mini: {
      immediate: false,
      handler (to, from) {
        this.$log('mini CHANGED', to)
        if (to) this.player.pause()
        else this.player.play()
      }
    },
    layerIndex: {
      immediate: false,
      handler (to, from) {
        this.$log('layerIndex CHANGED', to)
        if (to > -1) {
          this.player.setCurrentTime(this.layerStart)
          this.player.update()
        }
      }
    },
    layerIndexPlay: {
      immediate: true,
      handler (to, from) {
        this.$log('layerIndexPlay CHANGED', to)
        if (to > -1) this.layerIndex = to
      }
    },
    now: {
      handler (to, from) {
        // this.$log('now CHANGED', to)
        this.videoNow(to, from)
      }
    }
  },
  methods: {
    videoNow (to, from) {
      if (this.nowPause) return
      if (!this.active) this.player.pause()
      if (this.editing) return
      if (this.mode === 'play') {
        if (!this.layerStart && !this.layerEnd) return
        if (to > this.layerEnd) {
          let to = this.layerIndex + 1
          if (this.layers[to]) {
            this.$log('NEXT LAYER')
            this.layerIndex = to
          }
          else {
            if (this.layerIndex === 0) {
              this.player.setCurrentTime(this.layerStart)
            }
            else {
              this.layerIndex = 0
            }
          }
        }
        if (to < this.layerStart) {
          // this.$q.notify('to < this.layerStart' + this.layerStart)
          this.player.setCurrentTime(this.layerStart)
        }
      }
      else if (this.mode === 'layer') {
        if (!this.layerStart && !this.layerEnd) return
        if (this.layerIndexPlay > -1) {
          if (to > this.layerEnd) {
            this.$log('LAYER', this.layerIndex)
            this.player.setCurrentTime(this.layerStart)
          }
          if (to < this.layerStart) {
            this.player.setCurrentTime(this.layerStart)
          }
        }
      }
      else if (this.player.mode === 'watch') {
      }
    },
    videoForward (right) {
      // this.$log('videoForward')
      let to = this.now
      if (right > 0) {
        this.forwarding = 'right'
        to = to + 10 < this.duration ? to + 10 : this.duration
      }
      else {
        this.forwarding = 'left'
        to = to - 10 > 0 ? to - 10 : 0
      }
      this.forwardingCount += 10
      this.player.setCurrentTime(to)
      this.videoUpdate(null, to)
      if (this.forwardingInterval) clearTimeout(this.forwardingInterval)
      this.forwardingInterval = setTimeout(() => {
        this.forwarding = null
        this.forwardingCount = 0
      }, 400)
    },
    async videoMove () {
      if (!this.fullscreen) return
      this.$log('videoMove')
      // this.$set(this.player, 'controls', true)
      if (this.intervalMove) clearInterval(this.intervalMove)
      this.intervalMove = setTimeout(() => {
        // this.$set(this.player, 'controls', false)
      }, 2500)
    },
    videoLoadeddata () {
      this.$log('videoLoadeddata')
      if (this.visible) {
        this.player.setCurrentTime(this.layerStart)
      }
      if (this.visible && this.active && !this.mini) this.player.play()
      this.videoUpdate()
    },
    videoPlay (intervalUpdateIgnore) {
      this.$log('videoPlay')
      this.playing = true
      // if (!this.intervalUpdate) this.intervalUpdate = setInterval(this.videoUpdate, 1000 / 30)
    },
    videoPause () {
      this.$log('videoPause')
      this.playing = false
      // if (this.intervalUpdate) clearInterval(this.intervalUpdate)
      // this.intervalUpdate = null
    },
    videoPlayPause () {
      this.$log('videoPlayPause')
      if (this.playing) {
        if (this.muted) {
          this.player.mutedToggle()
        }
        else {
          this.player.pause()
        }
      }
      else this.player.play()
    },
    videoSeeked () {
      this.$log('videoSeeked')
      this.videoUpdate()
    },
    videoUpdate (e, to) {
      // this.$log('videoUpdate', to, this.now)
      // for kalpa using native video element
      if (this.contentSource === 'KALPA') {
        if (!this.$refs.kalpaVideo) return
        this.now = to || this.$refs.kalpaVideo.currentTime
        if (!this.duration) this.duration = this.$refs.kalpaVideo.duration
      }
      // for yotube use mediaElementPlayer
      else if (this.contentSource === 'YOUTUBE') {
        this.now = to || this.player.currentTime
        if (!this.duration) this.duration = this.player.duration
      }
    },
    async videoClick (e) {
      this.$log('videoClick', this.visible, this.active, !this.mini)
      if (this.active) {
        // TODO switch case mute/unmute play/pause
        // this.muted = !this.muted
        this.videoPlayPause()
      }
    },
    videoFullscreen () {
      this.$log('videoFullscreen')
      this.fullscreen = !this.fullscreen
      this.$q.fullscreen.toggle()
    },
    playerInit () {
      this.$log('playerInit', this.contentSource)
      if (this.contentSource === 'KALPA') {
        this.player = {}
        this.player.setCurrentTime = async (ms) => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.currentTime = ms
          this.nowPause = true
          await this.$wait(600)
          this.nowPause = false
        }
        this.player.play = () => {
          // this.$q.notify('play ?')
          if (this.$refs.kalpaVideo) {
            // this.$q.notify('play !')
            this.$refs.kalpaVideo.play()
          }
        }
        this.player.pause = () => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.pause()
        }
        this.player.remove = () => {
          // TODO
        }
        this.videoUpdate()
        // this.videoPlay()
      }
      else if (this.contentSource === 'YOUTUBE') {
        let me = new window.MediaElementPlayer(this.$refs.kalpaVideo, {
          loop: true,
          autoplay: false,
          controls: false,
          features: [], // 'playpause'
          // enableAutosize: true,
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
            this.player.addEventListener('timeupdate', this.videoUpdate)
            this.videoUpdate()
            // this.videoPlay()
          },
          youtube: {
            iv_load_policy: 3,
            modestbranding: 1
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('player YOUTUBE error')
          }
        })
      }
      // set player defaults
      this.player.update = (to) => {
        this.videoUpdate(null, to)
      }
      // muted custom toggle
      this.player.mutedToggle = () => {
        this.muted = !this.muted
        if (this.contentSource === 'KALPA') {
        }
        else if (this.contentSource === 'YOUTUBE') {
          this.player.setMuted(this.muted)
        }
      }
    },
    playerDestroy () {
      this.$log('playerDestroy', this.contentSource)
      if (this.contentSource === 'KALPA') {
      }
      else if (this.contentSource === 'YOTUBE') {
        this.player.removeEventListener('play', this.videoPlay)
        this.player.removeEventListener('pause', this.videoPause)
        this.player.removeEventListener('loadeddata', this.videoLoadeddata)
        this.player.removeEventListener('timeupdate', this.videoUpdate)
      }
    },
    onMeta (val) {
      this.$log('onMeta', val)
      switch (val[0]) {
        case 'videoUpdate': {
          this.videoUpdate(null, val[1])
          break
        }
        case 'videoPlayPause': {
          this.videoPlayPause()
          break
        }
        default: {
          this.$log('onMeta SET')
          this[val[0]] = val[1]
        }
      }
    },
    layerNameClick () {
      this.$log('layerNameClick')
      // TODO this fucntion should not be here...
      // go to sphere page...
    }
  },
  created () {
    this.$log('created')
    this.videoNow = throttle(this.videoNow, 300)
  },
  async mounted () {
    this.$log('mounted')
    this.playerInit()
    this.$on('meta', this.onMeta)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.playerDestroy()
  }
}
</script>
