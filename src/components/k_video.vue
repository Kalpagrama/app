<template lang="pug">
div(:style=`{position: 'relative'}`).row
  video(
    ref="kVideo"
    v-bind="$attrs" crossorigin="Anonymous"
    :style=`{height: '100%', width: '100%', objectFit: 'contain'}`
    :autoplay="true" :muted="true" loop playsinline
    @click="videoClick()"
    @seeked="seekEnded"
    @play="handlePlay"
    @timeupdate="now = $refs.kVideo.currentTime, $emit('now', now)"
    @playing="duration = $refs.kVideo.duration, $emit('duration', duration)"
    @pause="handlePause"
    @seeking="seekStarted")
  //- seeking spinner
  div(v-if="seeking" :style=`{position: 'absolute'}`).row.fit.items-center.justify-center
    q-spinner(size="50px" :thickness="4" color="white")
  //- forwards
  //- div(:style=`{position: 'absolute', zIndex: 10, width: '50%', height: '100%', left: '0px'}` @click="$refs.kVideo.currentTime -= 10")
  //- div(:style=`{position: 'absolute', zIndex: 10, width: '50%', height: '100%', right: '0px'}` @click="$refs.kVideo.currentTime += 10")
  div(v-if="toolsShow" :style=`{position: 'absolute', top: '0px', height: '48px'}`).row.full-width.items-center.q-px-sm.justify-end
    slot(name="default")
  //- tools
  div(v-show="toolsShow" :style=`{position: 'absolute', bottom: '10px', zIndex: 1000, height: '66px'}`).row.full-width
    //- actions
    div(v-if="actions" :style=`{height: '48px', paddingLeft: '10px', paddingRight: '20px'}`).row.full-width
      //- play/pause button
      div(:style=`{height: '48px', width: '48px'}`).row.items-center.justify-center
        q-btn(round flat color="white" :icon="playStarted ? 'pause' : 'play_arrow'" @click="videoPlayPause()")
      .col.full-height
        .row.fit.items-center.q-px-sm
          small(style=`user-select: none; background: rgba(0,0,0,0.4); borderRadius: 4px; overflow: hidden`).text-white.q-pa-xs {{ $time(now) }}/{{ $time(duration) }}
      //- volume up/down button
      div(:style=`{height: '48px', minWidth: '48px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="white" icon="fullscreen")
        q-btn(round flat color="white" icon="volume_up")
    //- timeline
    div(v-if="timeline" :style=`{height: '18px', paddingLeft: '30px', paddingRight: '30px'}`).row.full-width
      div(
        @click="timelineClick"
        v-touch-pan.mouse.stop="timelinePan"
        :style=`{position: 'relative', height: '18px', borderRadius: '2px', overflow: 'hidden'}`).row.full-width.items-end.bg-grey-6
        div(:style=`{pointerEvents: 'none', height: '18px', width: now/duration*100+'%'}`).row.bg-white
        //- cut
        div(
          v-if="cut"
          :style=`{
            position: 'absolute', zIndex: 1000, pointerEvents: 'none',
            left: cut.points[0].x/duration*100+'%',
            width: ((cut.points[1].x-cut.points[0].x)/duration)*100+'%', minWidth: '2px',
            height: '18px',
            background: $randomColor(cut.uid)}`)
</template>

<script>
export default {
  name: 'kVideo',
  props: {
    fragment: {
      type: Object
    },
    tools: {
      type: Boolean,
      default () {
        return true
      }
    },
    actions: {
      type: Boolean,
      default () {
        return true
      }
    },
    timeline: {
      type: Boolean,
      default () {
        return true
      }
    },
    cut: {
      type: [Object, Boolean],
      default () {
        return false
      }
    }
  },
  data () {
    return {
      now: 0,
      duration: 0,
      playStarted: false,
      seek: false,
      seeking: false,
      seekCount: 0,
      seekInterval: null,
      toolsShowLocal: true
    }
  },
  computed: {
    toolsShow () {
      if (this.tools) {
        return this.toolsShowLocal
      } else {
        return false
      }
    }
  },
  methods: {
    videoClick () {
      this.$logD('videoClick')
      if (this.toolsShowLocal) {
        // this.toolsShowLocal = false
      } else {
        // this.toolsShowLocal = true
        // setTimeout(() => {
        //   if (!this.playStarted) this.toolsShowLocal = false
        // }, 3000)
      }
    },
    videoPlayPause () {
      this.$logD('videoPlayPause')
      if (this.playStarted) this.pause()
      else this.play()
    },
    handlePlay (e) {
      this.$logD('handlePlay', e)
      this.playStarted = true
      this.seeking = false
    },
    play () {
      this.$refs.kVideo.play()
    },
    handlePause (e) {
      this.$logD('handlePause', e)
      this.playStarted = false
    },
    pause () {
      this.$refs.kVideo.pause()
    },
    go (time) {
      return new Promise((resolve, reject) => {
        if (this.$refs.kVideo) this.$refs.kVideo.currentTime = time
        this.seeking = true
        this.seekInterval = setInterval(() => {
          // this.$logD('seekInterval', this.seekCount)
          this.seekCount++
          if (this.seek || this.seekCount > 300) {
            clearInterval(this.seekInterval)
            resolve(time)
            this.seekCount = 0
            this.seeking = false
          } else {
            // clearInterval(this.seekInterval)
          }
        }, 100)
      })
    },
    goSync (time) {
      if (this.$refs.kVideo) this.$refs.kVideo.currentTime = time
    },
    seekStarted (e) {
      // this.$logD('seeking', e)
      this.seeking = true
      this.seek = false
    },
    seekEnded (e) {
      // this.$logD('seeked', e)
      this.seeking = false
      this.seek = true
    },
    async timelineClick (e) {
      this.$logD('timelineClick start')
      let left = e.layerX
      let w = e.target.clientWidth
      let now = this.duration * left / w
      // this.$logD('now', now)
      await this.go(now)
      // this.$emit('now', now)
      this.$logD('timelineClick done')
    },
    timelinePan (e) {
      // this.$logD('timelinePan', e)
      let left = e.position.left - 30
      let w = this.$q.screen.width - 60
      let now = this.duration * left / w
      // this.$logD('now', now)
      this.goSync(now)
    },
    playBack () {
      this.$logD('playBack')
      // this.$refs.kvideo.playBackwards = function () {
      //   this.pause()
      //   var video = this
      //   var fps = 25
      //   var intervalRewind = setInterval(function () {
      //     if (video.currentTime === 0) {
      //       clearInterval(intervalRewind)
      //       video.pause();
      //     } else {
      //       video.currentTime += -(1 / fps)
      //     }
      //   }, 1000 / fps)
      // }
    },
    videoLoaded (e) {
      this.$logD('videoLoaded')
      this.$emit('duration', this.$refs.kVideo.duration)
    },
    async getScreenshot (sec) {
      this.$logD('getScreenshot start', sec)
      this.pause()
      await this.go(sec)
      let canvas = document.createElement('canvas')
      canvas.width = this.fragment.content.width
      canvas.height = this.fragment.content.height
      this.$logD('canvas', canvas)
      let ctx = canvas.getContext('2d')
      ctx.drawImage(this.$refs.kVideo, 0, 0, canvas.width, canvas.height)
      let screenshot = canvas.toDataURL('image/jpeg', 0.5)
      await this.$wait(500)
      this.$logD('getScreenshot done')
      return screenshot
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    clearInterval(this.seekInterval)
  }
}
</script>
