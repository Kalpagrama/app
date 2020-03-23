<template lang="pug">
.row.full-width.items-start.content-start
  //- pregress wrapper
  .row.full-width.items-start.content-start.q-px-xl
    //- progress bar & time
    div(
      @click="progressClick"
      v-touch-pan.mouse.prevent.left.right="progressPan"
      :style=`{position: 'relative', zIndex: 300, height: '20px', borderRadius: '10px'}`).row.full-width.items-center.content-center
      //- progress WRAPPER
      div(
        ref="progressWrapper"
        :style=`{position: 'relative', height: '4px', zIndex: 200, borderRadius: '10px'}`
        ).row.full-width.bg-grey-9.cursor-pointer
        //- progress %
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 0,
            width: progressPercentWidth,
            borderRadius: '10px',
            pointerEvents: 'none', borderRight: '2px solid #4caf50'
          }`
          ).row.full-height.bg-grey-3
          //- progress POINT
          div(
            :style=`{
              position: 'absolute',
              top: -8+pointTop+'px',
              right: -pointHeight/2+'px',
              height: pointHeight+'px',
              width: pointHeight+'px',
              borderRadius: '50%'
            }`).bg-green
    //- progress actions
    div(:style=`{height: '60px', order: -1}`).row.full-width.items-center
      //- play/pause
      div(
        :style=`{minWidth: '60px', height: '60px'}`
        ).row.full-height.items-center.content-center.justify-center.q-px-md
        q-btn(
          round flat @click="$emit('meta', ['videoPlayPause', null])"
          :color="'white'"
          :icon="meta.playing ? 'pause' : 'play_arrow'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`).q-mr-md
        q-btn(
          round flat @click="player.mutedToggle()"
          color="white"
          :icon="meta.muted ? 'volume_off' : 'volume_up'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- stats
      .col
        .row.fit.items-center.content-center
          span(
            :style=`{pointerEvents: 'none', borderRadius: '10px', background: 'rgba(0,0,0,0.3)'}`
            ).text-white.q-pa-sm.q-ml-sm {{ $time(meta.now)+' / '+$time(meta.duration) }}
      //- sound
      div(
        v-if="false"
        :style=`{width: '60px', height: '60px'}`
        ).row.full-height.items-center.content-center.justify-center
        q-btn(
          round outline @click="player.mutedToggle()"
          color="white"
          :icon="meta.muted ? 'volume_up' : 'volume_off'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- fullscreen
      //- div(
      //-   v-show="false"
      //-   :style=`{width: '44px'}`
      //-   ).row.full-height.items-center.content-center.justify-center
      //-   q-btn(
      //-     round flat color="green" @click="videoFullscreen()"
      //-     :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
      //-     :style=`{background: 'rgba(0,0,0,0.3)'}`)
</template>

<script>
// TODO hide when playing...
export default {
  name: 'playerVideoProgress',
  props: ['player', 'meta'],
  data () {
    return {
      height: 20,
      progressPanning: false,
      progressWrapperLeft: 0,
      progressWrapperWidth: 0,
      progressDelta: 0,
      pointHeight: 20,
      pointTop: 0
    }
  },
  computed: {
    progressPercentWidth () {
      if (this.progressPanning) {
        return this.progressDelta + 'px'
      }
      else {
        let to = (this.meta.now / this.meta.duration) * 100
        if (this.pointDelta > 0 && this.progressPercentWidth > 0) {
          let from = (this.pointDelta / this.progressPercentWidth) * 100
          if (from === to) {
            return to + '%'
          }
          else {
            return from + '%'
          }
        }
        else {
          return to + '%'
        }
      }
    }
  },
  methods: {
    progressClick (e) {
      // this.$log('progressClick', e)
      let w = e.target.clientWidth
      let x = e.offsetX
      let to = (this.meta.duration * x) / w
      this.$emit('meta', ['mode', 'watch'])
      this.player.setCurrentTime(to)
      this.$emit('meta', ['videoUpdate', to])
    },
    progressPan (e) {
      // this.$log('progressPan', e)
      // start
      if (e.isFirst) {
        this.progressPanning = true
        let progressWrapperRef = this.$refs.progressWrapper
        // this.$log('progressWrapperRef', progressWrapperRef)
        let rect = progressWrapperRef.getBoundingClientRect()
        // this.$log('rect', rect)
        this.progressWrapperLeft = rect.left
        this.progressWrapperWidth = rect.width
        this.player.pause()
        this.$emit('meta', ['mode', 'watch'])
        // point style
        this.$tween.to(this, 0.2, {pointHeight: 34, pointTop: -7})
      }
      // get x position
      let x = e.position.left - this.progressWrapperLeft
      if (x > this.progressWrapperWidth) return
      let to = (this.meta.duration * x) / this.progressWrapperWidth
      this.progressDelta = x
      this.player.setCurrentTime(to)
      // final
      if (e.isFinal) {
        this.progressPanning = false
        this.$emit('meta', ['videoUpdate', to])
        // point style
        this.$tween.to(this, 0.2, {pointHeight: 20, pointTop: 0})
      }
    }
  }
}
</script>
