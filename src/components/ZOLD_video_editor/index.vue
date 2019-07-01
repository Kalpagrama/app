<template lang="pug">
div(style=`position: relative`).column.fit.bg-black
  //- header with close btn
  div(style=`height: 60px`).row.full-width.justify-end
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(flat round icon="check" color="white" @click="done()")
  //- tools
  div(style=`position: relative; overflow: hidden`).col.full-width
    div(style=`position: absolute; zIndex: 100; top: 0px; height: 60px`).row.full-width.bg-black
    video(v-show="videoShow" ref="kplayer" playsinline muted="true" autoplay width="100%" height="100%" preload="auto")
      source(type="video/youtube" :src="url")
    //- slider wrapper
    div(v-if="true" style=`position: absolute; zIndex: 100; height: 260px; bottom: 0px; paddingLeft: 50px; paddingRight: 50px`
      ).row.full-width.bg-black
      slider(
        v-if="duration"
        :mediaElement="mediaElement" :duration="duration"
        @startSec="$event => startSec = $event"
        @endSec="$event => endSec = $event"
        :current="currentSec"
        :start="start"
        :end="end")
</template>

<script>
import 'mediaelement/build/mediaelementplayer.min.css'
import 'mediaelement/full'
import slider from './slider'

export default {
  name: 'VideoEdit',
  components: { slider },
  props: {
    start: {type: Number},
    end: {type: Number},
    url: {type: String}
  },
  data () {
    return {
      videoShow: false,
      editor: null,
      mediaElement: null,
      startSec: 0,
      endSec: 0,
      currentSec: 0,
      duration: undefined,
      video: null
    }
  },
  methods: {
    async done () {
      let points = [{x: this.startSec}, {x: this.endSec}]
      this.$log('done points', points)
      this.$emit('done', points, this.duration)
      this.$emit('close')
    },
    timeUpdate (e) {
      this.duration = this.mediaElement.duration
      this.currentSec = this.mediaElement.currentTime
      if (this.mediaElement.currentTime >= this.endSec) this.mediaElement.setCurrentTime(this.startSec)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$log('start', this.start)
    this.$log('end', this.end)
    this.editor = new window.MediaElementPlayer(this.$refs.kplayer, {
      autoplay: true,
      controls: false,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        this.$log('mediaElement success!')
        this.mediaElement = mediaElement
        this.mediaElement.addEventListener('timeupdate', this.timeUpdate, false)
        this.mediaElement.setCurrentTime(this.startSec)
        // await this.$wait(2000)
        this.videoShow = true
        this.$log('duration!? ', this.mediaElement.duration)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.mediaElement.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
