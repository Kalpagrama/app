<template lang="pug">
div(:style=`{height: videoHeight+'px'}`).row.full-width.relative-position
  q-resize-observer(@resize="pageWidth = $event.width")
  youtube-player(v-if="playerType === 'player-youtube'" :url="url" @player-youtube="playerYoutube=$event"
    @loadeddata="videoLoadeddata"
    @timeupdate="videoTimeupdate"
    @pause="videoPaused"
    @play="videoPlaying").row.fit
  video(v-else
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
  ).row.fit
  // затемнение для ютуба on pause and desktops only and youtube
  .row.fit.absolute
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div( v-if="false && !playing && playerType === 'player-youtube' && !$screenProps.isMobile"
        :style=`{ background: 'linear-gradient(0deg, rgba(0,0,0,1) 200px, rgba(0,0,0,0) 100%)'}`
      ).row.full-width
  // оверлэй для видео
  .row.fit.absolute
    item-overlay(:item="contentKalpa" :player="thiz" :style=`{zIndex: 100}`)
</template>

<script>
import { ContentApi } from 'src/api/content'
import youtubePlayer from './youtube'
import itemOverlay from 'src/components/kalpa_item/item_feed/overlay'
import { assert } from 'src/system/common/utils'
import { ObjectTypeEnum } from 'src/system/common/enums'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'playerDefault',
  components: { itemOverlay, youtubePlayer },
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
      playerNative: null,
      playing: false,
      muted: true,
      duration: 0,
      currentTime__: 0,
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
        if (this.playerYoutube) {
           if (to) this.playerYoutube.mute()
           else this.playerYoutube.unMute()
        } else if (this.playerNative) {
          this.playerNative.muted = !!to
        }
        this.$rxdb.set(RxCollectionEnum.META, {id: 'sound_muted', value: to})
            .catch(err => this.$logE('err on mutedToggle', err))
      }
    },
  },
  methods: {
    setState (key, val) {
      // this.$log('setState', key, val)
      this.$set_deprecated(this, key, val)
    },
    play () {
      if (this.playerYoutube) this.playerYoutube.playVideo()
      else if (this.playerNative) this.playerNative.play()
    },
    pause () {
      this.$log('pause')
      if (this.playerYoutube) this.playerYoutube.pauseVideo()
      else if (this.playerNative) this.playerNative.pause()
    },
    replay () {
      this.$log('replay')
      this.setCurrentTime(0)
      this.play()
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
      this.currentTime = t
      if (this.playerYoutube) this.playerYoutube.seekTo(t)
      else if (this.playerNative) this.playerNative.currentTime = t
    },
    videoClick (e) {
      this.$log('videoClick', e)
      if (this.playerYoutube) {
        // do stuff
      } else if (this.playerNative) {
        if (this.playing) this.playerNative.pause()
        else this.playerNative.play()
      }
    },
    videoLoadeddata (e) {
      if (this.playerYoutube) this.duration = this.playerYoutube.getDuration()
      else if (this.playerNative) this.duration = this.playerNative.duration
    },
    videoTimeupdate (e) {
      // this.$logT('videoTimeupdate', e)
      if (this.playerYoutube) {
        this.currentTime__ = e
        if (!this.currentTimeFreeze) this.currentTime = e
        this.duration = this.playerYoutube.getDuration()
      } else if (this.playerNative) {
        this.currentTime__ = this.playerNative.currentTime
        if (!this.currentTimeFreeze) this.currentTime = this.playerNative.currentTime
        this.duration = this.playerNative.duration
      }
    },
    videoPaused (e) {
      // this.$log('videoPaused', e)
      this.playing = false
    },
    videoPlaying (e) {
      // this.$log('videoPlaying', e)
      this.playing = true
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
    if (this.$refs.videoRef) this.playerNative = this.$refs.videoRef
    this.muted = await this.$rxdb.get(RxCollectionEnum.META, 'sound_muted')
    // Loaded!
    this.$nextTick(() => this.$emit('player', this))
  },
  beforeUnmount () {
    this.$logT('beforeDestroy')
  }
}
</script>
