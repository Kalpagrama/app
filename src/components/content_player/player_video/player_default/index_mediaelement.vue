<style lang="sass">
#videoRef12345
  width: 100%
  height: 100%
  //border: 1px solid yellow
iframe[id$="_youtube_iframe"]
  width: 100%
  height: 100%
  //border: 1px solid green
</style>

<template lang="pug">
div(:style=`{height: videoHeight+'px'}`).row.full-width.relative-position.br
  q-resize-observer(@resize="pageWidth = $event.width")
  video(
    id="videoRef12345"
    ref="videoRef"
    :src="url"
    :playsinline="true"
    :autoplay="true"
    :loop="true"
    :muted="muted"
    :velocity="velocity"
    @click="videoClick"
    @loadeddata="videoLoadeddata"
    @timeupdate="videoTimeupdate"
    @pause="videoPaused"
    @play="videoPlaying"
  ).row.full-width
  // затемнение для ютуба on pause and desktops only and youtube
  .row.fit.absolute
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div( v-if="!playing && playerType === 'player-youtube' && !$screenProps.isMobile"
        :style=`{ background: 'linear-gradient(0deg, rgba(0,0,0,1) 200px, rgba(0,0,0,0) 100%)'}`
      ).row.full-width
  // оверлэй для видео
  .row.fit.absolute
    item-overlay(:item="contentKalpa" :player="thiz" :style=`{zIndex: 100}`)
</template>

<script>
import { ContentApi } from 'src/api/content'
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'
import { debounceIntervalItem } from 'src/system/rxdb/reactive'
import itemOverlay from 'src/components/kalpa_item/item_feed/overlay'
import { assert } from 'src/system/common/utils'
import { ObjectTypeEnum } from 'src/system/common/enums'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'playerDefault',
  components: { itemOverlay },
  props: {
    contentKalpa: { type: Object, required: true },
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  emits: ['player', 'error'],
  data () {
    return {
      pageWidth: null,
      events: null,
      thiz: this,
      playerYoutube: null,
      playing: false,
      playingCount: 0,
      muted: true,
      duration: 0,
      currentTimeNative: 0,
      currentTime: 0,
      currentTimeFreeze: false,
      node: null,
      nodeMode: null,
      clusters: [],
      figureFocused: null,
      velocity: 1.0,
      nodePlaying: null,
      isFullscreen: null
    }
  },
  computed: {
    seekTime () {
      if (!this.duration) return 0
      return Math.max(5, Math.min(Math.floor(this.duration * 0.05 / 10) * 10, 15))
    },
    videoHeight () {
      if (!this.pageWidth || !this.contentKalpa.height || !this.contentKalpa.width) return Math.min(this.$q.screen.height, this.options.maxHeight * 1.5 || 400)
      let ratio = this.contentKalpa.width / this.contentKalpa.height
      let maxHeight = Math.min(this.$q.screen.height, this.pageWidth / ratio)
      return Math.min(maxHeight, this.options.maxHeight)
    },
    url () {
      // this.$logT('url computed=', ContentApi.urlSelect(this.contentKalpa))
      return ContentApi.urlSelect(this.contentKalpa)
    },
    // Dynamic player depends on contentKalpa.url
    playerType () {
      if (this.url.includes('youtu')) return 'player-youtube' // контент не выкачан - показываем плеер ютуба
      else return 'player-kalpa' // есть выкачаннный контент
    },
    figures () {
      if (this.node) {
        return this.node.items[0].layers[0].figuresAbsolute
      } else {
        return null
      }
    }
  },
  watch: {
    node(to){
      if (!to) this.nodeMode = null
    },
    nodeMode(to){
      if (!to) this.node = null
    },
    muted: {
      handler(to) {
        if (this.playerType === 'player-youtube') {
          this.$logT('muted changed!', !!to, this.playerYoutube)
          if (this.playerYoutube) this.playerYoutube.setMuted(!!to)
        } else if (this.playerType === 'player-kalpa') {
          this.$refs.videoRef.muted = !!to
        }
        this.$rxdb.set(RxCollectionEnum.META, {id: 'sound_muted', value: to})
            .catch(err => this.$logE('err on mutedToggle', err))
      }
    },
    url: {
      async handler (to, from) {
        if (to) {
          this.$logT('url changed!!!', to)
          if (this.playerYoutube) this.playerYoutube.setSrc(to)
          // await this.$wait(1000 + debounceIntervalItem) // нужно дать время чтобы изменные urlWithFormats сохранились в rxdb
          // this.$logW('before reload!')
          // this.$logW('skip reload! TODO проверить что все работает!') // TODO проверить что все работает
          // window.location.reload() // TODO reload излишен!
          return true
        }
      }
    }
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
      this.$set_deprecated(this, key, val)
    },
    play () {
      this.$log('play')
      this.playingCount += 1
      if (this.playerType === 'player-youtube') {
        this.playerYoutube.play()
      } else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) this.$refs.videoRef.play()
      }
    },
    replay () {
      this.$log('replay')
      this.setCurrentTime(0)
      this.play()
    },
    pause () {
      this.$log('pause')
      if (this.playerType === 'player-youtube') {
        this.playerYoutube.pause()
      } else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) this.$refs.videoRef.pause()
      }
    },
    mutedToggle (val) {
      this.$logT('mutedToggle', this.muted, val)
      this.muted = val !== undefined ? val : !this.muted
    },
    seek (offset) {
      this.$logT('seek', offset)
      assert(typeof offset === 'number')
      this.node = null
      this.nodeMode = null
      let t = this.currentTime
      t += offset
      t = Math.max(0, Math.min(this.duration, t))
      this.setCurrentTime(t, true)
    },
    setCurrentTime (t, freeze = false) {
      // this.$log('setCurrentTime', t)
      if (freeze) {
        this.currentTimeFreeze = true
        clearTimeout(this.currentTimeFreezeTimer)
        this.currentTimeFreezeTimer = setTimeout(() => {
          this.currentTimeFreeze = false
        }, 1200)
      }
      if (this.playerType === 'player-youtube') {
        this.currentTime = t
        this.playerYoutube.setCurrentTime(t)
      } else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.currentTime = t
          this.$refs.videoRef.currentTime = t
        }
      }
    },
    videoClick (e) {
      this.$log('videoClick', e)
      if (this.playerType === 'player-youtube') {
        // do stuff
      } else if (this.playerType === 'player-kalpa') {
        if (this.playing) e.target.pause()
        else e.target.play()
      }
    },
    videoLoadeddata (e) {
      if (this.playerType === 'player-youtube') {
        this.duration = this.playerYoutube.duration
      } else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.duration = this.$refs.videoRef.duration
        }
      }
      // Loaded!
      this.$nextTick(() => this.$emit('player', this))
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      if (this.playerType === 'player-youtube') {
        this.currentTimeNative = this.playerYoutube.currentTime
        if (!this.currentTimeFreeze) this.currentTime = this.playerYoutube.currentTime
        this.duration = this.playerYoutube.duration
      } else if (this.playerType === 'player-kalpa') {
        if (this.$refs.videoRef) {
          this.currentTimeNative = this.$refs.videoRef.currentTime
          if (!this.currentTimeFreeze) this.currentTime = this.$refs.videoRef.currentTime
          this.duration = this.$refs.videoRef.duration
        }
      }
    },
    videoPaused (e) {
      // this.$log('videoPaused', e)
      if (this.playerType === 'player-youtube') {
        this.playing = false
      } else if (this.playerType === 'player-kalpa') {
        this.playing = false
      }
    },
    videoPlaying (e) {
      // this.$log('videoPlaying', e)
      if (this.playerType === 'player-youtube') {
        this.playing = true
      } else if (this.playerType === 'player-kalpa') {
        this.playing = true
      }
    },
    playerCreate (type) {
      this.$log('playerCreate', type)
      if (type === 'player-youtube') {
        const mejs = new window.MediaElementPlayer(this.$refs.videoRef, {
          loop: true,
          muted: this.muted,
          autoplay: true,
          controls: true,
          features: [],
          enableAutosize: true,
          stretching: 'fill', // auto fill none responsive
          pauseOtherPlayers: false,
          clickToPlayPause: true,
          // plugins: ['youtube'],
          success: async (mediaElement, originalNode, instance) => {
            // this.$logT('playerCreate done', mediaElement)
            this.playerYoutube = mediaElement
            this.playerYoutube.addEventListener('loadeddata', this.videoLoadeddata)
            this.playerYoutube.addEventListener('timeupdate', this.videoTimeupdate)
            this.playerYoutube.addEventListener('pause', this.videoPaused)
            this.playerYoutube.addEventListener('play', this.videoPlaying)
          },
          error: async (mediaElement, originalNode, instance) => {
            this.$log('playerCreate error')
            // this.$emit('error', mediaElement)
          }
        })
      } else if (type === 'player-kalpa') {
        //
      }
      // Add events bus for every player
      this.events = {
        on: (event, cb) => {
          if (this.$refs.videoRef) this.$refs.videoRef.addEventListener(event, cb)
        },
        off: (event, cb) => {
          if (this.$refs.videoRef) this.$refs.videoRef.removeEventListener(event, cb)
        },
        emit: (event, val) => {
          if (this.$refs.videoRef) this.$refs.videoRef.dispatchEvent(new CustomEvent(event, { detail: val }))
        }
      }
    },
    // выделить фрагмент и создать ядро(покажется редактор)
    fragmentSelect () {
      if (this.$store.getters.isGuest) this.$store.commit('ui/stateSet', ['authGuard', { message: 'Чтобы создать ядро, войдите в аккаунт' }])
      else {
        // Create node input
        let start = Math.max(0, this.currentTime - 15)
        let end = Math.min(start + 30, this.duration)
        let figures = [{ t: start, points: [] }, { t: end, points: [] }]
        let nodeInput = {
          name: '',
          category: null,
          spheres: [],
          layout: 'HORIZONTAL',
          vertices: [],
          items: [
            {
              id: Date.now().toString(),
              thumbUrl: this.contentKalpa.thumbUrl,
              thumbHeight: this.contentKalpa.thumbHeight,
              thumbWidth: this.contentKalpa.thumbWidth,
              outputType: 'VIDEO',
              layers: [
                {
                  id: Date.now().toString(),
                  contentOid: this.contentKalpa.oid,
                  figuresAbsolute: figures
                }
              ],
              operation: { items: null, operations: null, type: 'CONCAT' },
              type: ObjectTypeEnum.COMPOSITION
            }
          ]
        }
        this.setState('node', nodeInput)
        this.setState('nodeMode', 'edit')
      }
    },
    fragmentClear () {
      this.setState('node', null)
      this.setState('nodeMode', null)
    }
  },
  async mounted () {
    this.$logT('mounted')
    this.muted = await this.$rxdb.get(RxCollectionEnum.META, 'sound_muted')
    this.$nextTick(() => {
      this.playerCreate(this.playerType)
    })
  },
  beforeUnmount () {
    this.$logT('beforeDestroy')
    if (this.playerType === 'player-youtube') {
      this.playerYoutube.removeEventListener('loadeddata', this.videoLoadeddata)
      this.playerYoutube.removeEventListener('timeupdate', this.videoTimeupdate)
      this.playerYoutube.removeEventListener('pause', this.videoPaused)
      this.playerYoutube.removeEventListener('play', this.videoPlaying)
      this.playerYoutube.remove()
      this.playerYoutube = null
    }
  }
}
</script>
