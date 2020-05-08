<template lang="pug">
.row.full-width.items-start.content-start
  kalpa-keyboard-events(@keyup="windowKeyup")
  //- pregress wrapper
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.q-px-lg
    //- progress bar & time
    div(
      @click="progressClick"
      v-touch-pan.mouse.left.right="progressPan"
      @mousemove="progressMousemove"
      @mouseleave="progressMouseleave"
      :style=`{position: 'relative', zIndex: 300, height: '30px', paddingBottom: '10px', borderRadius: '10px'}`
      ).row.full-width.items-center.content-center.cursor-pointer
      //- progress WRAPPER
      div(
        ref="progressWrapper"
        :style=`{position: 'relative', height: '4px', zIndex: 200, borderRadius: '10px'}`
        ).row.full-width.bg-grey-7.cursor-pointer
        //- progress TIP
        div(
          v-if="progressMousemoveTime"
          :style=`{
            position: 'absolute',
            zIndex: 200,
            left: progressMousemoveLeft-25+'px',
            top: '-50px',
            minWidth: '50px',
            background: 'rgba(0,0,0,0.7)',
            borderRadius: '10px',
            padding: '10.5px',
            overflow: 'hidden'
          }`
          ).row
          span.text-white {{ $time(progressMousemoveTime) }}
        //- progress %
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 0,
            width: progressPercentWidth,
            borderRight: '2px solid #4caf50',
            borderRadius: '10px',
            pointerEvents: 'none',
          }`
          ).row.full-height.bg-green
          //- progress POINT
          div(
            :style=`{
              position: 'absolute',
              top: -pointHeight/2+2+'px',
              right: -pointHeight/2+'px',
              height: pointHeight+'px',
              width: pointHeight+'px',
              borderRadius: '50%'
            }`).bg-green
    //- actions
    div(
      :style=`{height: '60px', order: -1}`).row.full-width.items-center
      //- play/pause
      div(
        :style=`{height: '60px'}`
        ).row.full-height.items-end.content-end.justify-center
        q-btn(
          round flat @click="$emit('meta', ['videoPlayPause', null])"
          :color="'white'"
          :icon="meta.playing ? 'pause' : 'play_arrow'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
      //- stats
      .col.full-height
        .row.fit.items-end.content-end.justify-start.q-px-sm
          span(
            :style=`{pointerEvents: 'none', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', userSelect: 'none', padding: '10.5px'}`
            ).text-white {{ $time(meta.now)+' / '+$time(meta.duration) }}
      //- sound
      div(
        :style=`{height: '60px'}`
        ).row.full-height.items-end.content-end.justify-center
        q-btn(
          round flat @click="videoForward(0)"
          color="white"
          icon="fast_rewind"
          :style=`{background: 'rgba(0,0,0,0.3)'}`).q-mr-sm
        q-btn(
          round flat @click="videoForward(1)"
          color="white"
          icon="fast_forward"
          :style=`{background: 'rgba(0,0,0,0.3)'}`).q-mr-sm
        q-btn(
          round flat @click="player.mutedToggle()"
          color="white"
          :icon="meta.muted ? 'volume_off' : 'volume_up'"
          :style=`{background: 'rgba(0,0,0,0.3)'}`)
        //- q-btn(
        //-   round flat @click="player.mutedToggle()"
        //-   color="white"
        //-   :icon="meta.muted ? 'volume_off' : 'volume_up'"
        //-   :style=`{background: 'rgba(0,0,0,0.3)'}`).q-ml-sm
</template>

<script>
export default {
  name: 'playerVideoProgress',
  props: ['ctx', 'player', 'meta', 'start', 'end'],
  data () {
    return {
      height: 20,
      progressPanning: false,
      progressWrapperLeft: 0,
      progressWrapperWidth: 0,
      progressDelta: 0,
      pointHeight: 10,
      pointTop: 0,
      progressMousemoveLeft: null,
      progressMousemoveWidth: null,
      progressMousemoveTime: null
    }
  },
  computed: {
    duration () {
      if (this.ctx === 'list') {
        return this.end - this.start
      }
      else {
        return this.meta.duration
      }
    },
    now () {
      if (this.ctx === 'list') {
        return this.meta.now - this.start
      }
      else {
        return this.meta.now
      }
    },
    progressPercentWidth () {
      if (this.progressPanning) {
        return this.progressDelta + 'px'
      }
      else {
        let to = (this.now / this.duration) * 100
        return to + '%'
        // if (this.pointDelta > 0 && this.progressPercentWidth > 0) {
        //   let from = (this.pointDelta / this.progressPercentWidth) * 100
        //   if (from === to) {
        //     return to + '%'
        //   }
        //   else {
        //     return from + '%'
        //   }
        // }
        // else {
        //   return to + '%'
        // }
      }
    }
  },
  methods: {
    videoForward (forward) {
      this.$log('videoForward', forward)
      let to = this.meta.now
      if (forward > 0) to += 5
      else to -= 5
      if (to > this.meta.duration) to = this.meta.duration
      if (to < 0) to = 0
      this.player.setCurrentTime(to)
      this.player.update(to)
    },
    progressMousemove (e) {
      // this.$log('progressMousemove', e)
      let left = e.layerX
      let w = e.target.clientWidth
      // this.$log('left/w', left, w)
      if (!this.progressMousemoveWidth) this.progressMousemoveWidth = w
      this.progressMousemoveLeft = left
      this.progressMousemoveTime = (this.meta.duration * left) / w
    },
    progressMouseleave (e) {
      // this.$log('progressMouseleave', e)
      this.progressMousemoveLeft = null
      this.progressMousemoveTime = null
    },
    progressClick (e) {
      // this.$log('progressClick', e)
      let w = e.target.clientWidth
      let x = e.offsetX
      let to = (this.duration * x) / w
      if (this.ctx === 'list') to += this.start
      if (this.ctx !== 'list') {
        this.$emit('meta', ['mode', 'watch'])
      }
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
        if (this.ctx !== 'list') {
          this.$emit('meta', ['mode', 'watch'])
        }
        // point style
        this.$tween.to(this, 0.2, {pointHeight: 34, pointTop: -7})
      }
      // get x position
      let x = e.position.left - this.progressWrapperLeft
      if (x > this.progressWrapperWidth || x < 0) return
      let to = (this.duration * x) / this.progressWrapperWidth
      if (this.ctx === 'list') to += this.start
      this.progressDelta = x
      this.player.setCurrentTime(to)
      // final
      if (e.isFinal) {
        this.progressPanning = false
        this.$emit('meta', ['videoUpdate', to])
        // point style
        this.$tween.to(this, 0.2, {pointHeight: 10, pointTop: 0})
        this.progressMouseleave()
      }
    },
    windowKeyup (e) {
      this.$log('windowKeyup', e.keyCode)
      switch (e.keyCode) {
        // left
        case 37: {
          this.videoForward(0)
          break
        }
        // right
        case 39: {
          this.videoForward(1)
          break
        }
      }
    }
  }
}
</script>
