<template lang="pug">
 div(:style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-start.content-start
    video(
      ref="player-video"
      :src="url"
      :poster="composition.thumbUrl"
      :autoplay="true"
      :loop="true"
      :muted="true"
      :playsinline="true"
      :style=`{
        objectFit: 'contain',
        borderRadius: '10px',
      }`
      @click="videoClick"
      @pause="videoPaused"
      ).fit
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'videoAlways',
  props: ['composition', 'isActive'],
  data () {
    return {
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
  },
  watch: {
    isActive: {
      handler (to, from) {
        if (to) {
          this.$refs['player-video'].play()
        }
        else {
          this.$refs['player-video'].pause()
        }
      }
    }
  },
  methods: {
    videoClick (e) {
      this.$log('videoClick', e)
      if (e.target.muted) {
        e.target.muted = false
      }
      else {
        if (e.target.paused) {
          e.target.play()
        }
        else {
          // e.target.pause()
          this.videoRestart(e)
        }
      }
    },
    videoTimeupdate (e) {
      this.$log('videoTimeupdate', e)
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
