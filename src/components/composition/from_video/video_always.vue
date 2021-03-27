<template lang="pug">
div(
  :class=`{
    //- 'br': isVisible || isActive,
  }`
  :style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-start.content-start
  //- div(
    :style=`{
      position: 'absolute', zIndex: 200, top: '0px', transform: 'translate3d(0,0,10px)',
      opacity: 0.8,
    }`
    ).row.full-with.bg-red.text-white.bg
    small.full-width currentTime: {{currentTime}}
    small.full-width urlMeta: {{urlMeta}}
  img(
    v-show="!currentTimeChanged"
    :src="composition.thumbUrl"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      objectFit: objectFit || 'contain',
      borderRadius: '10px',
      opacity: 0.5,
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
  name: 'videoAlways',
  props: ['composition', 'isActive', 'isVisible', 'objectFit'],
  data () {
    return {
      currentTime: null,
      currentTimeChanged: false,
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.composition) },
    urlMeta () {
      let arr = this.url.split('#t=')
      let [start, end] = arr[1].split(',')
      return [
        {t: parseFloat(start)},
        {t: parseFloat(end)},
      ]
    },
    videoShow () {
      // return this.isActive
      // let currentTimeRight = currentTime
      return this.isActive || this.isVisible
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
          this.currentTimeChanged = false
        }
      }
    },
    currentTime: {
      handler (to, from) {
        if (to && from) {
          this.currentTimeChanged = true
        }
      }
    }
  },
  methods: {
    videoClick (e) {
      // this.$log('videoClick', e)
      if (e.target.muted) {
        e.target.muted = false
      }
      else {
        let width = e.target.clientWidth
        let left = e.layerX
        this.$log('videoClick', {width, left})
        if (left / width > 0.5) {
          if (e.target.paused) e.target.play()
          else e.target.pause()
        }
        else {
          this.videoRestart(e)
        }
      }
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      this.currentTime = e.target.currentTime
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
      // if (this.urlMeta) {
      //   e.target.currentTime = this.urlMeta[0].t
      //   e.target.play()
      // }
    }
  }
}
</script>
