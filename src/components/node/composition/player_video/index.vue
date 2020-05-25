<style lang="sass">
// iframe id looks like => mejs_017595170116808223_youtube_iframe
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
    border-radius: 1px
    overflow: hidden
    transform: scale(0.1)
    transform-origin: top left
    pointer-events: none
// iframe[id$="_youtube_iframe"]
//   width: 100%
//   height: 100%
//   border-radius: 10px
//   overflow: hidden
.mejs__overlay-button
  // display: none
  opacity: 0.2
  transform: scale(2)
.layer-name
  &:hover
    background: rgba(255,255,255,0.3) !important
</style>

<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.fit.items-start.content-start
  //- kalpa-keyboard-events(@keyup="windowKeyup")
  //- debug
  div(
    v-if="false"
    :style=`{
      position: 'absolute', width: 'calc(50%)', left: '8px', top: '60px',
      pointerEvents: 'none', userSelect: 'none', transform: 'translate3d(0,0,0)',
      zIndex: 10000, borderRadius: '10px', color: 'white', opacity: 0.8
    }`).row.q-pa-xs.bg-red
    small.full-width visible/active/mini: {{visible}}/{{active}}/{{mini}}
    small.full-width ctx/mode: {{ctx}}/{{mode}}
    //- small.full-width now/duration: {{now}}/{{duration}}
    //- small.full-width start/end: {{layerStart}}/{{layerEnd}}
    small.full-width layerIndex: {{layerIndex}}
    small.full-width layerIndexPlay: {{layerIndexPlay}}
    //- small.full-width player: {{player ? true : false}}
    //- small.full-wdith mini: {{mini}}
  //- video container
  div(
    :style=`{position: 'relative', overflow: 'hidden'}`).col.full-width
    div(
      @click="videoClick()"
      :style=`{position: 'absolute', zIndex: 1000}`
      ).row.fit
    //- video actions
    //- content name
    router-link(
      v-if="$q.screen.gt.xs && layer && content && visible && active && !mini"
      :to="'/content/'+content.oid"
      :style=`{
        position: 'absolute', zIndex: 20000, left: '8px',
        top: '8px',
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgba(0,0,0,0.3)'
      }`
      ).q-px-sm.q-py-xs.text-grey-2.cursor-pointer.layer-name
      small(:style=`{lineHeight: 0.5, userSelect: 'none'}`) {{ content.name }}
    //- layer name
    span(
      v-if="$q.screen.gt.xs && layer && layer.spheres.length > 0 && visible && active && !mini" @click="layerNameClick()"
      :style=`{
        position: 'absolute', zIndex: 20000, top: '40px', left: '8px',
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgba(0,0,0,0.3)'
      }`
      ).q-pa-sm.text-grey-2.cursor-pointer.layer-name {{ layer.spheres[0].name | cut(50) }}
    //- layer menu
    q-btn(
      v-if="true && content && visible && active && !mini"
      v-show="ctx !== 'workspace'"
      ref="layerMenuBtn"
      round flat color="grey-2" icon="more_vert"
      :style=`{
        position: 'absolute', zIndex: 2000, top: '8px', right: '8px',
        background: 'rgba(0,0,0,0.15)', transform: 'translate3d(0,0,0)'
      }`)
      q-menu(
        cover anchor="top right" max-width="300px")
        div(v-if="content").column.fit.bg-grey-9
          div(:style=`{minHeight: '50px'}`).row.full-width.items-center.content-center.q-pa-md
            span.text-white.text-bold {{ content.name }}
          .col.full-width.scroll
            q-btn(flat no-caps align="left" :to="'/content/'+content.oid").full-width
              span.text-white Explore content
            q-btn(flat no-caps align="left" @click="nodeWorkspace()").full-width
              span.text-white Save to workspace
            q-btn(flat no-caps align="left").full-width
              span.text-white Report
    //- video wrapper
    div(:style=`{
      position: 'absolute', zIndex: 10, top: '0px', height: 'calc(100% + 0px)',
      borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width
      video(
        ref="kalpaVideo"
        :src="contentUrl" :type="contentSource === 'YOUTUBE' ? 'video/youtube' : 'video/mp4'"
        playsinline :loop="true" :muted="mutedComputed" :controls="false"
        @loadeddata="videoLoadeddata" @play="videoPlay" @pause="videoPause" @ended="$emit('ended')"
        @timeupdate="videoUpdate"
        :style=`{
          position: 'relative', width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px', overflow: 'hidden',
          opacity: videoLoadeddataDone && videoGood ? 1 : 0
        }`)
    progress-maxi(
      v-if="ctx === 'workspace' || $q.screen.gt.xs && visible && active && !mini"
      :ctx="ctx" :player="player" :meta="meta" @meta="onMeta"
      :start="layerStart || 0" :end="layerEnd || duration"
      :style=`{
        position: 'absolute', zIndex: 20000, bottom: '0px', left: '0px', transform: 'translate3d(0,0,0)',
        maxWidth: itemsCount > 1 ? '75%' : 'calc(100% - 80px)'
      }`)
    progress-mini(
      v-if="true"
      :ctx="ctx" :player="player" :meta="meta"
      :start="layerStart || 0" :end="layerEnd || duration"
      :style=`{
        position: 'absolute', zIndex: 30000, bottom: '0px', transform: 'translate3d(0,0,0)',
      }`)
    //- progress-tint(
    //-   v-if="$q.screen.gt.xs && visible && active && !mini"
    //-   )
  slot(name="editor" :meta="meta" :player="player")
</template>

<script>
import {throttle} from 'quasar'
import progressMaxi from './progress_maxi'
import progressMini from './progress_mini'
import progressTint from './progress_tint'

export default {
  name: 'playerVideo',
  props: ['ctx', 'composition', 'visible', 'active', 'mini', 'itemsCount'],
  components: {progressMaxi, progressMini, progressTint},
  data () {
    return {
      now: 0,
      nowWorking: false,
      duration: 0,
      player: null,
      playerInited: false,
      playing: false,
      muted: true,
      autoplay: true,
      mode: 'play',
      layerIndex: 0,
      layerIndexPlay: -1,
      editing: false,
      videoLoadeddataDone: false,
      content: null,
      ended: false
    }
  },
  computed: {
    videoRef () {
      return this.$refs.kalpaVideo
    },
    meta () {
      return {
        now: this.now,
        duration: this.duration,
        playing: this.playing,
        muted: this.muted,
        mode: this.mode,
        content: this.content,
        layerIndexPlay: this.layerIndexPlay,
        layerIndex: this.layerIndex,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        layers: this.layers,
        layer: this.layer,
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
      if (!this.layer) return false
      if (this.ctx === 'workspace') {
        return this.layer.figuresAbsolute[0].t
      }
      else {
        return this.layer.figuresRelative[0].t
      }
    },
    layerEnd () {
      if (!this.layer) return false
      if (this.ctx === 'workspace') {
        return this.layer.figuresAbsolute[1].t
      }
      else {
        return this.layer.figuresRelative[1].t
      }
    },
    contentSource () {
      if (this.ctx === 'workspace') {
        return 'YOUTUBE'
      }
      else {
        return 'KALPA'
      }
      // if (this.content) return this.content.contentSource
      // else return null
      // return this.content.contentSource
    },
    contentUrl () {
      if (this.ctx === 'workspace') {
        if (this.content) return this.content.url
        else return null
      }
      else {
        // return `${this.layer.url}#t=${this.layerStart},${this.layerEnd}`
        return this.layer.url
      }
      // return this.content.url
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
    visible: {
      immediate: true,
      handler (to, from) {
        this.$log('visible CHANGED', to)
        if (!this.player) return
        if (this.layerStart) this.player.setCurrentTime(this.layerStart)
      }
    },
    active: {
      immediate: false,
      handler (to, from) {
        this.$log('active CHANGED', to)
        if (!this.player) return
        if (to) this.player.play()
        else this.player.pause()
      }
    },
    mini: {
      immediate: false,
      handler (to, from) {
        this.$log('mini CHANGED', to)
        // if (!this.player) return
        // if (to) this.player.pause()
        // else this.player.play()
      }
    },
    layer: {
      immediate: true,
      async handler (to, from) {
        this.$log('layer CHANGED', to)
        if (to) {
          this.content = await this.$store.dispatch('objects/get', {oid: to.contentOid})
          // this.$nextTick(() => {
          //   if (!this.player) this.playerInit()
          // })
          if (this.player) {
            this.player.setCurrentTime(this.layerStart)
            this.player.update()
          }
        }
      }
    },
    content: {
      immediate: true,
      handler (to, from) {
        this.$log('content CHANGED', to)
        if (to) {
          this.$nextTick(() => {
            if (!this.player) this.playerInit()
          })
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
    },
    videoGood: {
      handler (to, from) {
        this.$log('videoGood CHANGED', to)
        if (to) {
          this.$emit('good')
        }
      }
    }
  },
  methods: {
    async nodeWorkspace () {
      this.$log('nodeWorkspace')
      // TODO: what to save to ws? whole node? composition? layer?
      let nodeInput = {
        wsItemType: 'WS_NODE',
        stage: 'selected'
      }
      // let rxDoc = await this.$rxdb.upsertItem(nodeInput)
    },
    videoNow (to, from) {
      // this.$log('videoNow', to)
      // switch (this.mode) {
      //   case 'play': {
      //     if (to > this.layerEnd)
      //     break
      //   }
      //   case 'layer': {
      //     if (to > this.layerEnd) {
      //       this.nowWorking = true
      //     }
      //     else if (to < this.layerStart) {
      //       this.nowWorking = true
      //     }
      //     // all good
      //     else {
      //       this.nowWorking = false
      //     }
      //     break
      //   }
      //   case 'watch': {
      //     break
      //   }
      // }
      // if (this.nowWorking || this.editing || this.ended) {
      //   this.nowWorking = false
      //   return
      // }
      this.nowWorking = true
      if (this.mode === 'play') {
        if (!this.layerStart && !this.layerEnd) return
        if (to > this.layerEnd) {
          // alert('to > this.layerEnd')
          let to = this.layerIndex + 1
          if (this.layers[to]) {
            this.$log('NEXT LAYER')
            // alert('NEXT LAYER')
            this.layerIndex = to
          }
          else {
            // if (this.layerIndex === 0) {
            //   this.player.setCurrentTime(this.layerStart)
            // }
            // else {
            //   this.layerIndex = 0
            // }
            this.ended = true
            this.player.pause()
            this.$emit('ended')
            // alert('ended')
          }
        }
        if (to < this.layerStart) {
          this.player.setCurrentTime(this.layerStart)
        }
      }
      else if (this.mode === 'layer') {
        // if (!this.layerStart && !this.layerEnd) return
        if (this.editing) {
          // alert('GOT editing')
          return
        }
        if (this.layerIndexPlay > -1) {
          if (to > this.layerEnd) {
            // this.$log('LAYER', this.layerIndex)
            this.player.pause()
            this.player.setCurrentTime(this.layerStart)
            // alert('mode:layer, to > layerEnd')
          }
          if (to < this.layerStart) {
            this.player.setCurrentTime(this.layerStart)
            // alert('mode:layer, to < layerStart')
          }
        }
      }
      else if (this.mode === 'watch') {
      }
      this.nowWorking = false
    },
    videoLoadeddata () {
      this.$log('videoLoadeddata')
      // alert('videoLoadeddata' + this.composition.oid)
      this.videoLoadeddataDone = true
      if (!this.player) return
      if (this.visible) {
        if (this.player) {
          this.player.setCurrentTime(this.layerStart)
        }
      }
      if (this.visible && this.active && !this.mini) this.player.play()
      if (!this.active) this.player.pause()
      if (!this.visible) this.player.pause()
      this.videoUpdate()
      if (this.ctx === 'workspace') {
        this.player.mutedToggle()
      }
      this.$wait(400).then(() => {
        this.$emit('loaded')
      })
    },
    videoPlay (intervalUpdateIgnore) {
      this.$log('videoPlay')
      this.playing = true
    },
    videoPause () {
      this.$log('videoPause')
      this.playing = false
    },
    videoPlayPause () {
      this.$log('videoPlayPause', this.playing)
      if (this.playing) {
        this.player.pause()
      }
      else this.player.play()
      if (this.muted) {
        this.player.mutedToggle()
      }
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
      this.$log('videoClick')
      this.videoPlayPause()
    },
    playerInit () {
      this.$log('playerInit START')
      // this.$log('platerInit content', this.content)
      if (this.contentSource === 'KALPA') {
        this.player = {}
        this.player.setCurrentTime = async (ms) => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.currentTime = ms
        }
        this.player.play = () => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.play()
        }
        this.player.pause = () => {
          if (this.$refs.kalpaVideo) this.$refs.kalpaVideo.pause()
        }
        this.videoUpdate()
      }
      else if (this.contentSource === 'YOUTUBE') {
        let ref = this.$refs.kalpaVideo
        this.$log('playerInit ref: ', ref)
        this.$log('playerInit url:', this.content.url)
        let me = new window.MediaElementPlayer(ref, {
          loop: true,
          autoplay: false,
          controls: false,
          features: [], // 'playpause'
          // enableAutosize: true,
          stretching: 'fill',
          pauseOtherPlayers: false,
          // plugins: ['youtube'],
          // ignorePauseOtherPlayersOption: false,
          clickToPlayPause: false,
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
            modestbranding: 1,
            controls: 0
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('player YOUTUBE error')
          }
        })
      }
      // set player defaults for all the players
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
        if (!this.$store.state.ui.iWantSound) this.$store.commit('ui/stateSet', ['iWantSound', true])
      }
      if (this.$store.state.ui.iWantSound) {
        if (this.$q.platform.is.ios) {
        }
        else {
          this.player.mutedToggle()
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
    },
    windowKeyup (e) {
      this.$log('windowKeyup', e.keyCode)
      switch (e.keyCode) {
        // space
        case 32: {
          this.videoPlayPause()
          break
        }
        // left
        // case 37: {
        //   let to = this.now - 5
        //   if (to < 0) to = 0
        //   // this.$parent.$emit('meta', ['mode', 'watch'])
        //   this.player.setCurrentTime(to)
        //   this.player.update()
        //   break
        // }
        // // right
        // case 39: {
        //   let to = this.now + 5
        //   if (to > this.duration) to = this.duration
        //   // this.$parent.$emit('meta', ['mode', 'watch'])
        //   this.player.setCurrentTime(to)
        //   this.player.update()
        //   break
        // }
      }
    }
  },
  async created () {
    this.$log('created')
    // this.videoNow = throttle(this.videoNow, 300)
  },
  async mounted () {
    // this.$log('mounted')
    // alert('mounted')
    this.$on('meta', this.onMeta)
    if (this.composition.contentOid) {
      this.content = await this.$store.dispatch('objects/get', {oid: this.composition.contentOid})
    }
    // window.addEventListener('keyup', this.windowKeyup)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // window.removeEventListener('keyup', this.windowKeyup)
    this.playerDestroy()
  }
}
</script>
