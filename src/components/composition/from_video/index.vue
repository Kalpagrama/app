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
    ).row.fit.items-center.content-center.justify-center
    q-spinner(color="white" size="50px")
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
    ref="player-video"
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
        if (!this.$refs['player-video']) return
        if (to) {
          this.$refs['player-video'].play()
        }
        else {
          this.$refs['player-video'].pause()
          this.$refs['player-video'].src = ''
          this.$refs['player-video'].load()
          this.currentTimeChanged = false
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
    replay () {
      this.$log('replay')
      if (this.$refs['player-video']) {
        this.$refs['player-video'].currentTime = this.urlMeta[0].t
        this.$refs['player-video'].play()
      }
    },
    mutedToggle () {
      this.$log('mutedToggle')
      if (this.$refs['player-video']) {
        if (this.$refs['player-video'].muted) {
          localStorage.setItem('k_sound', 'on')
        }
        else {
          localStorage.removeItem('k_sound')
        }
        this.$refs['player-video'].muted = !this.$refs['player-video'].muted
        this.player.muted = !this.player.muted
      }
    },
    setCurrentTime (t) {
      this.$log('setCurrentTime')
      if (this.$refs['player-video']) {
        this.$refs['player-video'] = t + this.urlMeta[0].t
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
    videoPaused (e) {
      this.$log('videoPaused', e)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.$refs['player-video']) {
      this.$refs['player-video'].src = ''
      this.$refs['player-video'].load()
    }
  }
}
</script>
