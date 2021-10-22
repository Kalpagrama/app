<template lang="pug">
  div(:style=`{ position: 'absolute', zIndex: 10}`).row.fit.items-start.content-start
    div(
      v-if="$store.state.ui.useDebug"
      :style=`{
      position: 'absolute', zIndex: 200, top: '0px', transform: 'translate3d(0,0,10px)',
      opacity: 0.8,
    }`
    ).row.full-with.bg-red.text-white
      //- small.full-width currentTime: {{data.currentTime}}
      small.full-width urlMeta: {{urlMeta}}
    slot(name="footer" :player="data.player")
    //span.text-green {{id}} statusPlayer={{statusPlayer}} isPlayerVisible={{isPlayerVisible}} data.playBackReady={{data.playBackReady}}
    // spinner + playBtn
    div(
      v-if="isPlayerVisible && statusPlayer !== 'playing'"
      :style=`{ position: 'absolute', zIndex: 101, top: '0px', opacity: 0.5}`
      @click="play()"
    ).row.fit.items-center.content-center.justify-center
      q-spinner(v-show="data.statusPlayerLag === 'loading'" color="white" size="50px")
      q-icon(v-if="data.statusPlayerLag === 'paused'" name="play_circle_outline" size="90px" color="grey")
    // poster
    img(
      :src="composition.thumbUrl"
      :style=`{
      position: 'absolute',
      objectFit: objectFit || 'contain',
      // borderRadius: '10px',
      zIndex: data.currentTimeChangedCnt > 0 ? 'auto' : 100
      // background: 'rgb(35,35,35)',
    }`
    ).fit
    //transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    video(
      v-if="isPlayerVisible"
      ref="videoRef"
      type="video/mp4"
      preload="metadata"
      :autoplay="false"
      :loop="false"
      :muted="true"
      :playsinline="true"
      :style=`{
      position: 'absolute',
      objectFit: objectFit || 'contain',
      // borderRadius: '10px',
    }`
      @click="videoClick"
      @timeupdate="videoTimeupdate"
      @waiting="data.playBackLoading = true"
      @canplay="data.playBackLoading = false, data.playBackReady=true, onCanPlay()"
      @pause="data.playBackState = 'paused'"
      @play="data.playBackState = 'playing'"
      @playing="data.playBackState = 'playing'"
      :src="url"
    ).fit
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { ContentApi } from 'src/api/content'
import { assert } from 'src/system/common/utils'

export default {
  name: 'fromVideo',
  props: ['composition', 'itemState', 'isActive', 'isVisible', 'objectFit', 'options'],
  computed: {
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name + this.composition.oid
      if (!this.itemState[key]) {
        this.$set(this.itemState, key, {
          currentTime: null,
          player: null,
          playBackState: 'paused',
          playBackLoading: false,
          playBackReady: false,
          statusPlayerLag: null,
          currentTimeChangedCnt: 0,
          videoRef: null
        })
      }
      return this.itemState[key]
    },
    url () {
      return ContentApi.urlSelect(this.composition)
    },
    urlMeta () {
      let arr = this.url.split('#t=')
      if (arr[1]) {
        let [start, end] = arr[1].split(',')
        return [
          { t: parseFloat(start) },
          { t: parseFloat(end) }
        ]
      } else {
        // на выкачанных композициях нет #t
        let duration = 0
        for (let l of this.composition.layers) duration += l.figuresAbsolute[1].t - l.figuresAbsolute[0].t
        return [
          { t: 0 },
          { t: duration }
        ]
      }
    },
    isPlayerVisible () {
      return !!this.isActive
    },
    statusPlayer () { // playing|paused|loading
      if (this.data.playBackLoading) return 'loading'
      return this.data.playBackState
    }
  },
  watch: {
    statusPlayer: {
      handler (to, from) {
        clearTimeout(this.timerStatusPlayer)
        this.timerStatusPlayer = setTimeout(() => {
          this.data.statusPlayerLag = this.statusPlayer
        }, 700)
      }
    },
    'options.playBackState': {
      immediate: true,
      handler (to, from) {
        // this.$log('options.playBackState:', to, this?.composition?.layers[0]?.contentName)
        if (to === 'paused') this.pause()
        else if (to === 'playing') this.play()
      }
    },
    isActive: {
      immediate: true,
      handler (to, from) {
        this.data.playBackReady = false
        this.data.playBackState = 'paused'
        this.data.playBackLoading = false
        this.data.currentTimeChangedCnt = 0
        this.data.statusPlayerLag = null
        // this.$log('isActive=', to, this.id, this?.composition?.layers[0]?.contentName)
        if (to) {
          this.$nextTick(() => {
            if (this.$refs.videoRef) {
              this.data.playBackState = this.$refs.videoRef.paused ? 'paused' : 'playing'
              this.play()
            }
          })
        } else {
          this.cancelLoad()
        }
      }
    },
    'data.currentTime': {
      handler (to, from) {
        if (to && from) {
          this.data.currentTimeChangedCnt++
          if (to >= this.urlMeta[1].t - 0.3 || to < this.urlMeta[0].t - 1) {
            if (to < this.urlMeta[0].t - 1) this.$logW('range miss hit:', to, JSON.stringify(this.urlMeta))
            // this.$log('ended:', this.urlMeta[0].t, this.urlMeta[1].t, this.urlMeta[1].t - 0.3, this.urlMeta[0].t)
            this.play(this.urlMeta[0].t)
            this.$emit('ended')
          }
        }
      }
    }
  },
  methods: {
    onCanPlay () {
      // this.$logE('onCanPlay', this.options.playBackState, this?.composition?.layers[0]?.contentName)
      if (this.options.playBackState === 'paused') this.pause()
      // else if (this.options.playBackState === 'playing') this.play()
    },
    videoClick (e) {
      // this.$log('videoClick', e)
      if (e.target.muted && localStorage.getItem('k_sound')) {
        e.target.muted = false
      } else {
        // if (e.target.paused) e.target.play()
        // else e.target.pause()
        if (this.data.playBackState === 'paused') this.play()
        else this.pause()
      }
    },
    play (fromTime = null) {
      if (this.$refs.videoRef) {
        // this.$log('play. fromTime=', fromTime, this.id, this?.composition?.layers[0]?.contentName)
        if (fromTime) this.$refs.videoRef.currentTime = fromTime
        this.playPromise = this.$refs.videoRef.play()
        this.playPromise.then(() => {
          // this.$log('play OK!', this?.composition?.layers[0]?.contentName)
        }).catch(err => {
          this.$logD('error om play video. this.$refs.videoRef=', this.$refs.videoRef)
          this.$logE('error om play video', err)
        })
      }
    },
    pause () {
      if (this.playPromise) {
        this.playPromise.then(_ => {
          if (this.$refs.videoRef) {
            this.$log('pause', this?.composition?.layers[0]?.contentName)
            this.$refs.videoRef.pause()
          }
          this.data.statusPlayerLag = 'paused' // force lag
        })
      }
    },
    cancelLoad () {
      if (this.$refs.videoRef) {
        // отменяем загрузку видео (чтобы браузер не грузил в фоне)
        this.$log('cancelLoad', this.$refs.videoRef.src)
        this.$refs.videoRef.pause()
        this.$refs.videoRef.src = ''
        this.$refs.videoRef.load()
      }
    },
    mutedToggle () {
      // this.$log('mutedToggle')
      if (this.$refs.videoRef) {
        if (this.$refs.videoRef.muted) {
          localStorage.setItem('k_sound', 'on')
        } else {
          localStorage.removeItem('k_sound')
        }
        this.$refs.videoRef.muted = !this.$refs.videoRef.muted
        this.data.player.muted = !this.data.player.muted
      }
    },
    setCurrentTime (t) {
      // this.$log('setCurrentTime')
      if (this.$refs.videoRef) {
        this.$refs.videoRef = t + this.urlMeta[0].t
      }
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      this.data.currentTime = e.target.currentTime
      if (this.data.player) {
        this.data.player.muted = e.target.muted
        this.data.player.duration = this.urlMeta[1].t - this.urlMeta[0].t
        this.data.player.currentTime = e.target.currentTime - this.urlMeta[0].t
      } else {
        this.data.player = {
          play () {
            e.target.play()
          },
          pause () {
            e.target.pause()
          },
          setCurrentTime: this.setCurrentTime,
          mutedToggle: this.mutedToggle,
          replay: () => this.play(this.urlMeta[0].t),
          muted: e.target.muted,
          duration: this.urlMeta[1].t - this.urlMeta[0].t,
          currentTime: e.target.currentTime - this.urlMeta[0].t
        }
      }
      if (localStorage.getItem('k_sound') && this.$q.platform.is.desktop) {
        e.target.muted = false
        this.data.player.muted = false
      }
    }
  },
  created () {
    this.id = Date.now()
    // this.$log('created', this.id, this.isActive, this.isVisible, this?.composition?.layers[0]?.contentName)
  },
  beforeDestroy () {
    // отменяем загрузку видео (чтобы браузер не грузил в фоне)
    // this.$log('beforeDestroy', this?.composition?.layers[0]?.contentName)
    this.cancelLoad()
  }
}
</script>
