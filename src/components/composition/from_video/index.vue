<template lang="pug">
div(
  :class=`{
    //- 'br': isVisible || isActive,
  }`
  :style=`{
    position: 'absolute', zIndex: 10,
  }`).row.fit.items-start.content-start
  //- div(
    :style=`{
      position: 'absolute', zIndex: 200, top: '0px', transform: 'translate3d(0,0,10px)',
      opacity: 0.8,
    }`
    ).row.full-with.bg-red.text-white.bg
    small.full-width currentTime: {{currentTime}}
    small.full-width urlMeta: {{urlMeta}}
  slot(name="footer" :player="player")
  div(
    v-if="isActive && !currentTimeChanged"
    :style=`{
      position: 'absolute', zIndex: 101, top: '0px',
      opacity: 0.5,
    }`
    @click="play()"
    ).row.fit.items-center.content-center.justify-center
    q-spinner(
      v-show="canShowSpinner"
      color="white" size="50px")
  img(
    v-if="!currentTimeChanged"
    :src="composition.thumbUrl"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      objectFit: objectFit || 'contain',
      borderRadius: '10px',
      opacity: currentTimeChanged ? 0 : 1,
    }`
    ).fit
  //- :poster="composition.thumbUrl"
  video(
    v-if="videoShow"
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
    @pause="videoPaused"
    @play="videoPlaying"
    @timeupdate="videoTimeupdate"
    ).fit
    source(:src="url")
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'fromVideo',
  props: ['composition', 'isActive', 'isVisible', 'objectFit'],
  data () {
    return {
      currentTime: null,
      currentTimeChanged: false,
      player: null,
      playing: false,
      canShowSpinner: false,
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.composition) },
    urlMeta () {
      let arr = this.url.split('#t=')
      if (arr[1]) {
        let [start, end] = arr[1].split(',')
        return [
          {t: parseFloat(start)},
          {t: parseFloat(end)},
        ]
      } else {
        // на выкачанных композициях нет #t
        let duration = 0
        for (let l of this.composition.layers) duration += l.figuresAbsolute[1].t - l.figuresAbsolute[0].t
        return [
          {t: 0},
          {t: duration}
        ]
      }
    },
    videoShow () {
      return this.isActive
    },
  },
  watch: {
    isActive: {
      handler (to, from) {
        if (to) {
          if (this.$refs.videoRef) {
            this.$refs.videoRef.play()
          }
          this.$wait(1000).then(() => {
            this.canShowSpinner = true
          })
        }
        else {
          if (this.$refs.videoRef) {
            this.$refs.videoRef.pause()
            this.$refs.videoRef.src = ''
            this.$refs.videoRef.load()
          }
          this.currentTimeChanged = false
          this.canShowSpinner = false
        }
      }
    },
    currentTime: {
      handler (to, from) {
        if (to && from) {
          this.currentTimeChanged = true
          if (to >= this.urlMeta[1].t - 0.3) {
            this.replay()
          }
        }
      }
    }
  },
  methods: {
    videoClick (e) {
      this.$log('videoClick', e)
      // if (e.target.muted) {
      //   e.target.muted = false
      // }
      // else {
      //   let width = e.target.clientWidth
      //   let left = e.layerX
      //   this.$log('videoClick', {width, left})
      //   if (left / width > 0.5) {
      //     if (e.target.paused) e.target.play()
      //     else e.target.pause()
      //   }
      //   else {
      //     this.videoRestart(e)
      //   }
      // }
      if (e.target.muted && localStorage.getItem('k_sound')) {
        e.target.muted = false
      }
      else {
        if (e.target.paused) e.target.play()
        else e.target.pause()
      }
    },
    play () {
      this.$log('play')
      if (this.$refs.videoRef) {
        this.$refs.videoRef.play()
      }
    },
    replay () {
      this.$log('replay')
      if (this.$refs.videRef) {
        this.$refs.videoRef.currentTime = this.urlMeta[0].t
        this.$refs.videoRef.play()
      }
    },
    mutedToggle () {
      this.$log('mutedToggle')
      if (this.$refs.videoRef) {
        if (this.$refs.videoRef.muted) {
          localStorage.setItem('k_sound', 'on')
        }
        else {
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
      }
      else {
        this.player = {
          play () {
            e.target.play()
          },
          pause () {
            e.target.pause()
          },
          setCurrentTime: this.setCurrentTime,
          mutedToggle: this.mutedToggle,
          replay: this.replay,
          muted: e.target.muted,
          duration: this.urlMeta[1].t - this.urlMeta[0].t,
          currentTime: e.target.currentTime - this.urlMeta[0].t
        }
      }
      if (localStorage.getItem('k_sound') && this.$q.platform.is.desktop) {
        e.target.muted = false
        this.player.muted = false
      }
    },
    videoRestart (e) {
      this.$log('videoRestart', e)
      if (this.urlMeta) {
        e.target.currentTime = this.urlMeta[0].t
        e.target.play()
      }
    },
    videoPlaying (e) {
      // this.$log('videoPlaying', e)
      this.playing = true
    },
    videoPaused (e) {
      // this.$log('videoPaused', e)
      this.playing = false
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    if (this.$refs.videoRef) {
      this.$refs.videoRef.src = ''
      this.$refs.videoRef.load()
    }
  }
}
</script>
