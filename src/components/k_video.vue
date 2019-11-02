<template lang="pug">
div(:style=`{position: 'relative'}`).row
  video(
    ref="kVideo"
    v-bind="$attrs" crossorigin="Anonymous"
    :style=`{height: '100%', width: '100%', objectFit: 'contain'}`
    :muted="true"
    @click="click"
    @seeked="seeked"
    @play="handlePlay"
    @timeupdate="now = $refs.kVideo.currentTime, $emit('now', now)"
    @playing="duration = $refs.kVideo.duration, $emit('duration', duration)"
    @pause="handlePause"
    @seeking="seeking")
  //- forwards
  //- div(:style=`{position: 'absolute', zIndex: 10, width: '50%', height: '100%', left: '0px'}` @click="$refs.kVideo.currentTime -= 10")
  //- div(:style=`{position: 'absolute', zIndex: 10, width: '50%', height: '100%', right: '0px'}` @click="$refs.kVideo.currentTime += 10")
  //- tools
  div(v-show="tools" :style=`{position: 'absolute', bottom: '0px', zIndex: 1000, height: '66px'}`).row.full-width
    //- actions
    div(v-if="actions" :style=`{height: '48px', paddingLeft: '10px', paddingRight: '20px'}`).row.full-width
      //- play/pause button
      div(:style=`{height: '48px', width: '48px'}`).row.items-center.justify-center
        q-btn(round flat color="white" :icon="playStarted ? 'pause' : 'play_arrow'" @click="click()")
      .col.full-height
        .row.fit.items-center.q-px-sm
          span(style=`user-select: none; background: rgba(0,0,0,0.4); borderRadius: 4px; overflow: hidden`).text-white.q-pa-xs {{ $time(now) }}/{{ $time(duration) }}
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
        //- timeline points
        //- div(
        //-   v-for="(p, pi) in fragment.relativePoints" :key="pi" v-if="(pi+1) % 2 !== 0"
        //-   :style=`{
        //-     position: 'absolute', left: (p.x/duration)*100+'%', pointerEvents: 'none',
        //-     borderRadius: '1px',
        //-     width: Math.abs(p.x - fragment.relativePoints[pi + 1].x)/duration*100+'%',
        //-     height: '9px', background: $randomColor(pi)}`).row
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
  },
  data () {
    return {
      now: 0,
      duration: 0,
      playStarted: false,
      seek: false,
      seekCount: 0,
      seekInterval: null
    }
  },
  methods: {
    click () {
      this.$log('click')
      if (this.playStarted) this.pause()
      else this.play()
    },
    handlePlay (e) {
      this.$log('handlePlay', e)
      this.playStarted = true
    },
    play () {
      this.$refs.kVideo.play()
    },
    handlePause (e) {
      this.$log('handlePause', e)
      this.playStarted = false
    },
    pause () {
      this.$refs.kVideo.pause()
    },
    go (time) {
      return new Promise((resolve, reject) => {
        this.$refs.kVideo.currentTime = time
        this.seekInterval = setInterval(() => {
          // this.$log('seekInterval', this.seekCount)
          this.seekCount++
          if (this.seek || this.seekCount > 300) {
            clearInterval(this.seekInterval)
            resolve(time)
            this.seekCount = 0
          } else {
            // clearInterval(this.seekInterval)
          }
        }, 100)
      })
    },
    goSync (time) {
      this.$refs.kVideo.currentTime = time
    },
    seeked (e) {
      // this.$log('seeked', e)
      this.seek = true
    },
    seeking (e) {
      // this.$log('seeking', e)
      this.seek = false
    },
    async timelineClick (e) {
      this.$log('timelineClick start')
      let left = e.layerX
      let w = e.target.clientWidth
      let now = this.duration * left / w
      // this.$log('now', now)
      await this.go(now)
      // this.$emit('now', now)
      this.$log('timelineClick done')
    },
    timelinePan (e) {
      // this.$log('timelinePan', e)
      let left = e.position.left - 30
      let w = this.$q.screen.width - 60
      let now = this.duration * left / w
      // this.$log('now', now)
      this.goSync(now)
    },
    playBack () {
      this.$log('playBack')
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
      this.$log('videoLoaded')
      this.$emit('duration', this.$refs.kVideo.duration)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    clearInterval(this.seekInterval)
  }
}
</script>
