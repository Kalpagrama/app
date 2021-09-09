<template lang="pug">
  div(
    :class=`{
    //- 'br': isVisible || isActive,
  }`
    :style=`{
    position: 'absolute', zIndex: 10,
  }`).row.fit.items-start.content-start
    div(
      v-if="$store.state.ui.useDebug"
      :style=`{
      position: 'absolute', zIndex: 200, top: '0px', transform: 'translate3d(0,0,10px)',
      opacity: 0.8,
    }`
    ).row.full-with.bg-red.text-white
      //- small.full-width currentTime: {{currentTime}}
      small.full-width urlMeta: {{urlMeta}}
    slot(name="footer" :player="player")
    // spinner + playBtn
    div(
      v-if="isPlayerVisible && statusPlayer !== 'playing'"
      :style=`{ position: 'absolute', zIndex: 101, top: '0px', opacity: 0.5}`
      @click="play()"
    ).row.fit.items-center.content-center.justify-center
      q-spinner(v-show="statusPlayer === 'loading'" color="white" size="50px")
      q-icon(v-if="statusPlayer === 'paused'" name="play_circle_outline" size="90px" color="grey")
    // poster
    img(
      v-if="!isPlayerVisible || !playBackReady"
      :src="composition.thumbUrl"
      :style=`{
      position: 'absolute',
      zIndex: 100,
      objectFit: objectFit || 'contain',
      borderRadius: '10px',
    }`
    ).fit.br
    video(
      v-if="isPlayerVisible"
      ref="videoRef"
      type="video/mp4"
      preload="metadata"
      :autoplay="isActive"
      :loop="true"
      :muted="true"
      :playsinline="true"
      :style=`{
      objectFit: objectFit || 'contain',
      borderRadius: '10px',
    }`
      @click="videoClick"
      @timeupdate="videoTimeupdate"
      @waiting="playBackLoading = true"
      @canplay="playBackLoading = false, playBackReady=true, onCanPlay()"
      @pause="playBackState = 'paused'"
      @play="playBackState = 'playing'"
      @playing="playBackState = 'playing'"
      :src="url"
    ).fit
    //span.text-red.text-bold.absolute-center statusPlayer={{statusPlayer}} isPlayerVisible={{isPlayerVisible}} playBackReady={{playBackReady}}
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'fromVideo',
  props: ['composition', 'isActive', 'isVisible', 'objectFit', 'options'],
  data () {
    return {
      currentTime: null,
      player: null,
      playBackState: 'paused',
      playBackLoading: false,
      playBackReady: false
    }
  },
  computed: {
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
      if (this.playBackLoading) return 'loading'
      return this.playBackState
    }
  },
  watch: {
    'options.playBackState': {
      immediate: true,
      handler (to, from) {
        this.$log('options.playBackState:', to, this?.composition?.layers[0]?.contentName)
        if (to === 'paused') this.pause()
        else if (to === 'playing') this.play()
      }
    },
    isActive: {
      handler (to, from) {
        this.playBackReady = false
        this.playBackState = 'paused'
        this.playBackLoading = false

        if (!to && this.$refs.videoRef) {
          // отменяем загрузку видео (чтобы браузер не грузил в фоне)
          this.$refs.videoRef.pause()
          this.$refs.videoRef.src = ''
          this.$refs.videoRef.load()
        } else {
          this.$nextTick(() => {
            if (this.$refs.videoRef) {
              this.playBackState = this.$refs.videoRef.paused ? 'paused' : 'playing'
              this.play()
            }
          })
        }
      }
    },
    currentTime: {
      handler (to, from) {
        if (to && from) {
          if (to >= this.urlMeta[1].t - 0.3 || to < this.urlMeta[0].t) {
            this.play(this.urlMeta[0].t)
            this.$log('ended:', this?.composition?.layers[0]?.contentName)
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
    },
    videoClick (e) {
      this.$log('videoClick', e)
      if (e.target.muted && localStorage.getItem('k_sound')) {
        e.target.muted = false
      } else {
        // if (e.target.paused) e.target.play()
        // else e.target.pause()
        if (this.playBackState === 'paused') this.play()
        else this.pause()
      }
    },
    play (fromTime = null) {
      this.$log('play', this?.composition?.layers[0]?.contentName)
      if (this.$refs.videoRef) {
        if (fromTime) this.$refs.videoRef.currentTime = fromTime
        this.playPromise = this.$refs.videoRef.play()
      }
    },
    pause () {
      this.$log('pause', this?.composition?.layers[0]?.contentName)
      if (this.playPromise) {
        this.playPromise.then(_ => {
          if (this.$refs.videoRef) this.$refs.videoRef.pause()
        }).catch(error => {
          this.$logE('error om play video', error)
        });
      }
    },
    mutedToggle () {
      this.$log('mutedToggle')
      if (this.$refs.videoRef) {
        if (this.$refs.videoRef.muted) {
          localStorage.setItem('k_sound', 'on')
        } else {
          localStorage.removeItem('k_sound')
        }
        this.$refs.videoRef.muted = !this.$refs.videoRef.muted
        this.player.muted = !this.player.muted
      }
    },
    setCurrentTime (t) {
      this.$log('setCurrentTime')
      if (this.$refs.videoRef) {
        this.$refs.videoRef = t + this.urlMeta[0].t
      }
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      this.currentTime = e.target.currentTime
      if (this.player) {
        this.player.muted = e.target.muted
        this.player.duration = this.urlMeta[1].t - this.urlMeta[0].t
        this.player.currentTime = e.target.currentTime - this.urlMeta[0].t
      } else {
        this.player = {
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
        this.player.muted = false
      }
    }
  },
  beforeDestroy () {
    // отменяем загрузку видео (чтобы браузер не грузил в фоне)
    if (this.$refs.videoRef) {
      this.$refs.videoRef.src = ''
      this.$refs.videoRef.load()
    }
  }
}
</script>
