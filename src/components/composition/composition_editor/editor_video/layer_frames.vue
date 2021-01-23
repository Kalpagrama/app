<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- scroll wrapper
  div(
    ref="layerItemFramesScrollArea"
    :style=`{
      paddingTop: '20px',
      paddingBottom: '50px',
      overflow: pointDragging ? 'hidden !important' : 'auto',
    }`).row.full-width.scroll
    .row.items-start.content-start.no-wrap
      //- left margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
      //- center
      div(
        @click="framesClick"
        v-touch-pan.left.right.mouse="framesDrag"
        accessKey="frames"
        :style=`{
          position: 'relative',
          height: '50px',
          borderRadius: '10px',
        }`).row.no-wrap.items-center.content-center.justify-start.b-220
        //- frames
        div(
          :style=`{
            minWidth: framesWidth+'px', width: framesWidth+'px', height: '50px', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).row
          div(
            v-for="f in framesCount" :key="f"
            :style=`{
              height: '50px', width: frameWidth+'px', pointerEvents: 'none',
              borderRight: f === framesCount+1 ? 'none' : '1px solid rgb(120,120,120)',
            }`
            ).row.items-center.content-center.justify-center
            span(:style=`{userSelect: 'none', pointerEvents: 'none'}`).text-grey-9 {{ $time((f - 1)*10) }}
        //- currentTime line
        div(
          v-show="!pointDragging"
          :style=`{
            position: 'absolute', zIndex: 2000,
            left: 'calc('+(player.currentTime/player.duration)*100+'% - 2px)',
            top: '-7px',
            height: 'calc(100% + 14px)',
            width: '4px',
            borderRadius: '2px', overflow: 'hidden',
            pointerEvents: 'none'
          }`
          ).bg-red
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 10px + 2px)',
            height: '50px',
            width: '20px',
            cursor: 'grabbing',
            borderRadius: '4px',
            background: 'rgba(76,175,79,0.5)'
          }`
          ).row.items-center.content-center.justify-center
          q-icon(
            name="more_vert" color="white" size="22px"
            :style=`{pointerEvents: 'none'}`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% - 10px - 2px)',
            height: '50px',
            width: '20px',
            cursor: 'grabbing',
            borderRadius: '4px',
            background: 'rgba(76,175,79,0.5)'
          }`
          ).row.items-center.content-center.justify-center
          q-icon(
            name="more_vert" color="white" size="22px"
            :style=`{pointerEvents: 'none'}`)
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-4px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 0px)',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration)*100+'% + 0px)',
            height: 50+8+'px',
            borderRadius: '10px',
            border: '4px solid rgb(76,175,80)',
            pointerEvents: 'none',
          }`).br
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
  //- actions at the bottom
  div(
    :style=`{
      position: 'absolute', zIndex: 300, bottom: '4px',
      left: '0px', width: '100%',
    }`
    ).row.items-center.content-center.justify-center.q-px-xs
    div(:style=`{maxWidth: '400px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat dense color="grey-8" icon="flip" @click="layerSet(0)" :style=`{position: 'relative'}`).rotate-180
      .col
      q-btn(round flat dense color="grey-8" @click="layerForward(0,false)")
        q-icon(name="keyboard_arrow_left" color="grey-8" size="30px")
      q-btn(round flat dense color="grey-8" @click="layerForward(0,true)")
        q-icon(name="keyboard_arrow_right" color="grey-8" size="30px")
      .col
      small(
        :class=`{
          'text-red': layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t > 60,
          'text-grey-7': layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t <= 60
        }`
        ) {{$time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)}}
      .col
      q-btn(round flat dense color="grey-8" @click="layerForward(1,false)")
        q-icon(name="keyboard_arrow_left" color="grey-8" size="30px")
      q-btn(round flat dense color="grey-8" @click="layerForward(1,true)")
        q-icon(name="keyboard_arrow_right" color="grey-8" size="30px")
      .col
      q-btn(round flat dense color="grey-8" icon="flip" @click="layerSet(1)" :style=`{position: 'relative'}`)
</template>

<script>
export default {
  name: 'layerFrames',
  props: ['player', 'layer', 'layerStart', 'layerEnd', 'layerDuration', 'tickFramesLayerCenter'],
  data () {
    return {
      width: 0,
      framesDragging: false,
      pointDragging: false,
      pointDraggingIndex: null,
      pointDraggingError: false,
      layerForwarding: null,
      actionsShow: false,
      compositionPlaying: true
    }
  },
  computed: {
    durationScreen () {
      let res
      if (this.player.duration > 120) res = 60
      else res = this.player.duration
      return res
    },
    framesCount () {
      return Math.round(this.player.duration / 10)
    },
    framesWidth () {
      let widthFrames
      let widthScreen = this.width * 0.7
      let durationScreen = this.durationScreen
      let duration = this.player.duration
      // durationScreen === widthScreen
      // duration === x
      widthFrames = (duration * widthScreen) / this.durationScreen
      return widthFrames
    },
    frameWidth () {
      let widthFrame
      let widthFrames = this.framesWidth
      let durationFrame = 10
      let duration = this.player.duration
      // durationFrame === *widthFrame*
      // duration == widthFrames
      widthFrame = (widthFrames * durationFrame) / duration
      return widthFrame
    },
  },
  watch: {
    'player.currentTime': {
      deep: true,
      handler (to, from) {
        if (!this.compositionPlaying) return
        // this.$log('player.currentTime TO', to)
        if (to > this.layerEnd) {
          this.$log('>= layerEnd')
          this.player.setCurrentTime(this.layerStart)
        }
        // if (to < this.layerStart) {
        //   this.$log('< layerStart')
        //   this.player.setCurrentTime(this.layerStart)
        //   this.player.play()
        // }
      }
    },
    tickFramesLayerCenter: {
      handler (to, from) {
        if (to) {
          this.$log('tickFramesLayerCenter TO', to)
          this.framesLayerCenter()
        }
      }
    },
    framesWidth: {
      handler (to, from) {
        if (to > 0) {
          this.framesLayerCenter()
        }
      }
    }
  },
  methods: {
    async layerSet (pointIndex) {
      this.$log('layerSet', pointIndex)
      let t = this.player.currentTime
      if (pointIndex === 0) {
        // wanna start AFTER the end
        if (t >= this.layerEnd) {
          this.$set(this.layer.figuresAbsolute[0], 't', t)
          this.$set(this.layer.figuresAbsolute[1], 't', Math.min(t + 10, this.player.duration))
        }
        // before the end is OK
        else {
          this.$set(this.layer.figuresAbsolute[0], 't', t)
        }
      }
      else if (pointIndex === 1) {
        // wanna end BEFORE the start
        if (t <= this.layerStart) {
          this.$set(this.layer.figuresAbsolute[0], 't', t)
          this.$set(this.layer.figuresAbsolute[1], 't', Math.min(t + 10, this.player.duration))
        }
        // after the start is OK
        else {
          this.$set(this.layer.figuresAbsolute[1], 't', t)
        }
      }
      // go to the layer new (maybe) start and play
      if (pointIndex === 0) {
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
      }
      else if (pointIndex === 1) {
        let t = this.layer.figuresAbsolute[1].t - 1.5
        if (t < this.layer.figuresAbsolute[0].t) t = this.layer.figuresAbsolute[0].t
        this.player.setCurrentTime(t)
        // this.player.events.emit('edit-end')
        this.compositionPlaying = true
      }
      this.player.play()
      // center frames
      await this.$wait(300)
      this.framesLayerCenter()
    },
    layerForward (pointIndex, goingForward) {
      this.$log('layerForward', pointIndex, goingForward)
      if (this.player.playing) this.player.pause()
      let t = this.layer.figuresAbsolute[pointIndex].t
      // this.player.events.emit('edit-start')
      this.compositionPlaying = false
      if (goingForward) t += 0.1
      else t -= 0.1
      this.$log('t', t)
      this.$set(this.layer.figuresAbsolute[pointIndex], 't', t)
      this.player.setCurrentTime(t)
      // waiting for the end of clicking...
      if (this.layerForwarding) {
        clearTimeout(this.layerForwarding)
      }
      this.layerForwarding = setTimeout(() => {
        this.$log('layerForwarding DONE')
        if (pointIndex === 0) {
          // do nothing...
        }
        else {
          let tBeforeTheEnd = t - 3 > this.layerStart ? t - 3 : this.layerStart
          this.$log('tBeforeTheEnd', tBeforeTheEnd)
          this.player.setCurrentTime(tBeforeTheEnd)
        }
        this.framesLayerCenter()
        this.player.play()
        // this.player.events.emit('edit-end')
        this.compositionPlaying = true
        this.layerForwarding = null
      }, 500)
    },
    async pointDrag (e, index) {
      // this.$log('pointDrag', e, index)
      let t = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.player.duration)
      if (t > this.player.duration || t < 0) return
      // this.$log('t', t)
      if (index === 0) {
        if (t >= this.layerEnd) {
          this.pointDraggingError = true
          return
        }
      }
      if (index === 1) {
        if (t <= this.layerStart) {
          this.pointDraggingError = true
          return
        }
      }
      this.player.setCurrentTime(t)
      this.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        this.player.pause()
        // this.player.events.emit('edit-start')
        this.compositionPlaying = false
        this.pointDragging = true
        this.pointDraggingIndex = index
      }
      if (e.isFinal) {
        // this.player.events.emit('edit-end')
        this.compositionPlaying = true
        this.pointDragging = false
        this.pointDraggingIndex = null
        await this.$wait(300)
        this.framesLayerCenter()
        this.pointDraggingError = false
        // final action of pointDragging, the same layerForward...
        if (index === 0) {
          this.player.setCurrentTime(t)
          this.player.play()
          // this.player.pause()
        }
        else {
          let tBeforeTheEnd = t - 3 > this.layerStart ? t - 3 : this.layerStart
          this.$log('tBeforeTheEnd', tBeforeTheEnd)
          this.player.setCurrentTime(tBeforeTheEnd)
          this.player.play()
        }
      }
    },
    async framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      // this.player.events.emit('edit-event', {t: t})
      let t = e.offsetX / this.framesWidth * this.player.duration
      this.$log('t', t)
      // move frames in we not in the fragment borders
      if (t < this.layerStart || t > this.layerEnd) {
        this.$log('framesClick OUTside')
        // this.player.events.emit('edit-start')
        let index = 0
        if (t > this.layerEnd) index = 1
        this.layer.figuresAbsolute[index].t = t
        this.player.setCurrentTime(t)
        await this.$wait(240)
        this.framesLayerCenter()
      }
      else {
        this.player.setCurrentTime(t)
      }
    },
    framesDrag (e) {
      // this.$log('framesDrag', e)
      if (this.pointDragging) return
      if (e.isFirst) {
        this.framesDragging = true
      }
      if (e.isFinal) {
        this.framesDragging = false
      }
      if (this.$q.platform.has.touch) return
      this.$refs.layerItemFramesScrollArea.scrollLeft -= e.delta.x
    },
    framesLayerCenter () {
      // this.$log('framesLayerCenter)
      let layerLeft = ((this.layerStart / this.player.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = (this.layerDuration / this.player.duration) * this.framesWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      // this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerItemFramesScrollArea, 0.5, {scrollLeft: scrollLeft})
    },
    async playerBarClickHandle (e) {
      this.$log('playerBarClickHandle', e.detail.t)
      let t = e.detail.t
      // move frames in we not in the fragment borders
      if (t < this.layerStart || t > this.layerEnd) {
        let start = e.detail.t
        let end = start + 30 < this.player.duration ? start + 30 : this.player.duration
        this.layer.figuresAbsolute[0].t = start
        this.layer.figuresAbsolute[1].t = end
        await this.$wait(250)
        this.framesLayerCenter()
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.player.events.on('bar-click', this.playerBarClickHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.events.off('bar-click', this.playerBarClickHandle)
  }
}
</script>
