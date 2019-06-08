<template lang="pug">
div(style=`position: relative`).column.fit.bg-black
  //- header with close btn
  div(style=`height: 60px`).row.full-width.justify-end
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(flat round icon="check" color="white" @click="done()")
  //- tools
  div(style=`position: relative; overflow: hidden`).col.full-width
    div(style=`position: absolute; zIndex: 100; top: 0px; height: 60px`).row.full-width.bg-black
    //- video :poster="video.snippet.thumbnails.high.url"
    video(
      id="kvideo"
      playsinline
      width="100%"
      height="100%")
      source(type="video/youtube" :src="url")
    //- slider wrapper
    div(v-if="true" style=`position: absolute; zIndex: 100; height: 190px; bottom: 0px`
      ).row.full-width.bg-black.q-px-xl
      slider(
        v-if="editorReady"
        :editor="editor" :currentSec="currentSec"
        @startSec="$event => startSec = $event"
        @endSec="$event => endSec = $event"
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
    type: {type: String},
    // points: {type: Array},
    start: {type: Number},
    end: {type: Number},
    url: {type: String}
  },
  data () {
    return {
      editor: null,
      editorReady: false,
      startSec: 0,
      endSec: 0,
      currentSec: 0,
      video: null
    }
  },
  methods: {
    async done () {
      let points = [{x: this.startSec}, {x: this.endSec}]
      this.$log('done', points)
      // await this.$wait(3000)
      this.$emit('done', points)
      this.$emit('close')
    },
    timeUpdate (e) {
      // this.$log('timeUpdate', e)
      this.currentSec = e.timeStamp
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$log('start', this.start)
    this.$log('end', this.end)
    this.editor = new window.MediaElementPlayer('kvideo', {
      // autoplay: true,
      showPosterWhenPaused: false,
      clickToPlayPause: true,
      iPadUseNativeControls: false,
      iPhoneUseNativeControls: false,
      AndroidUseNativeControls: false,
      success: async (mediaElement, originalNode, instance) => {
        await this.$wait(2000)
        this.editorReady = true
        this.video = document.getElementById('kvideo')
        this.video.addEventListener('timeupdate', this.timeUpdate, false)
      }
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.video.removeEventListener('timeupdate', this.timeUpdate)
  }
}
</script>
