<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- overflowY: 'hidden',
  div(
    ref="layerItemFramesScrollArea"
    :style=`{paddingTop: '20px', paddingBottom: '70px'}`).row.full-width.scroll
    .row.items-start.content-start.no-wrap
      //- left margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
      //- center
      //- TODO: desktop only framesDragging
      div(
        @click="framesClick"
        v-touch-pan.left.right.prevent.mouse="$q.screen.width > 600 ? framesDrag : false"
        accessKey="frames"
        :style=`{
          position: 'relative',
          height: '50px',
          borderRadius: '10px',
        }`).row.no-wrap.items-center.content-center.justify-start.b-220
        //- frames
        div(:style=`{minWidth: framesWidth+'px', width: framesWidth+'px', height: '50px', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).row
          div(
            v-for="f in framesCount" :key="f"
            :style=`{
              height: '50px', width: frameWidth+'px', pointerEvents: 'none',
              borderRight: f === framesCount+1 ? 'none' : '1px solid rgb(120,120,120)',
            }`
            ).row.items-center.content-center.justify-center
            span(:style=`{userSelect: 'none', pointerEvents: 'none'}`) {{ $time((f - 1)*10) }}
        //- currentTime line
        div(
          v-show="!poingDragging && (player.currentTime < layerStart || player.currentTime > layerEnd)"
          :style=`{
            position: 'absolute', zIndex: 200,
            left: 'calc('+(player.currentTime/player.duration)*100+'% - 0px)',
            top: '-16px',
            height: 'calc(100% + 32px)',
            width: '4px',
            borderRadius: '2px', overflow: 'hidden',
            pointerEvents: 'none'
          }`
          ).bg-red
        //- left tint
        //- div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: '0px',
            width: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% + 8px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: '10px',
          }`)
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 50px)',
            height: '50px',
            width: '50px',
            cursor: 'grabbing',
            borderRadius: '10px',
            //- opacity: 0.55,
            background: 'rgba(76,175,79,0.55)'
          }`
          ).row.items-center.content-center.justify-center
          q-icon(
            name="drag_indicator" color="white" size="24px"
            :style=`{pointerEvents: 'none'}`)
        //- right tint
        //- div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% + 8px)',
            width: 'calc('+((player.duration-layer.figuresAbsolute[1].t)/player.duration)*100+'% + 1px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: '10px',
          }`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% + 8px)',
            height: '50px',
            width: '50px',
            cursor: 'grabbing',
            borderRadius: '10px',
            //- opacity: 0.55,
            background: 'rgba(76,175,79,0.55)'
          }`
          ).row.items-center.content-center.justify-center
          q-icon(
            name="drag_indicator" color="white" size="24px"
            :style=`{pointerEvents: 'none'}`)
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-8px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 8px)',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration)*100+'% + 24px)',
            height: 50+8+8+'px',
            borderRadius: '18px',
            border: '8px solid rgb(76,175,80)',
            pointerEvents: 'none',
          }`)
        //- meta
        div(:style=`{
          position: 'absolute', zIndex: 400, top: '-7px',
          left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% + 0px)',
          width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration)*100+'% + 8px)',
          height: 50+8+8+'px',
          }`).row
          slot(name="meta" :panning="pointDragging")
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
  //- actions at the bottom
  div(
    :style=`{
      position: 'absolute', zIndex: 300, bottom: '0px',
      left: '0px', width: '100%',
    }`
    ).row.items-center.content-center.justify-center
    div(:style=`{maxWidth: '300px'}`).row.full-width.items-center.content-center.no-wrap
      q-btn(round flat dense color="white" icon="flip" @click="layerSet(0)" :style=`{position: 'relative'}`).rotate-180
        div(:style=`{
          position: 'absolute', zIndex: 100,
          left: 'calc(50% - 2px)', width: '3px',
          height: '80%', top: '10%',
          borderRadius: '2px',
          opacity: 0.9
        }`).row.bg-red
      q-btn(round flat dense color="white" @click="layerForward(0,false)")
        q-icon(name="keyboard_arrow_left" color="white" size="30px")
      q-btn(round flat dense color="white" @click="layerForward(0,true)")
        q-icon(name="keyboard_arrow_right" color="white" size="30px")
      .col
      small(
        :class=`{
          'text-red': layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t > 60,
          'text-white': layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t <= 60
        }`
        ).q-mt-sm {{$time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)}}
      .col
      q-btn(round flat dense color="white" @click="layerForward(1,false)")
        q-icon(name="keyboard_arrow_left" color="white" size="30px")
      q-btn(round flat dense color="white" @click="layerForward(1,true)")
        q-icon(name="keyboard_arrow_right" color="white" size="30px")
      q-btn(round flat dense color="white" icon="flip" @click="layerSet(1)" :style=`{position: 'relative'}`)
        div(:style=`{
          position: 'absolute', zIndex: 100,
          left: 'calc(50% - 2px)', width: '3px',
          height: '80%', top: '10%',
          borderRadius: '2px',
          opacity: 0.9
        }`).row.bg-red
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
      layerForwarding: null
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
    layer: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$store.commit('ui/stateSet', ['contentNodes', ])
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
        this.player.events.emit('edit-end')
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
      this.player.events.emit('edit-start')
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
        this.player.events.emit('edit-end')
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
        this.player.events.emit('edit-start')
        this.pointDragging = true
        this.pointDraggingIndex = index
      }
      if (e.isFinal) {
        this.player.events.emit('edit-end')
        this.pointDragging = false
        this.pointDraggingIndex = null
        await this.$wait(300)
        this.framesLayerCenter()
        this.pointDraggingError = false
        // final action of pointDragging, the same layerForward...
        if (index === 0) {
          this.player.play()
        }
        else {
          let tBeforeTheEnd = t - 3 > this.layerStart ? t - 3 : this.layerStart
          this.$log('tBeforeTheEnd', tBeforeTheEnd)
          this.player.setCurrentTime(tBeforeTheEnd)
          this.player.play()
        }
      }
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      // this.player.events.emit('edit-event', {t: t})
      let t = e.offsetX / this.framesWidth * this.player.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      // play layer if got this frames...
      if (t > this.layerStart && t < this.layerEnd) {
        // do nothing...
        // TODO: unreacheable code,cos we listen only for targer === frames!
        this.$log('framesClick INside')
        this.player.events.emit('edit-end')
      }
      else {
        this.$log('framesClick OUTside')
        this.player.events.emit('edit-start')
      }
    },
    framesDrag (e) {
      // this.$log('framesDrag', e)
      if (this.poingDragging) return
      if (this.$q.screen.xs) return
      this.$refs.layerItemFramesScrollArea.scrollLeft -= e.delta.x
      if (e.isFirst) this.framesDragging = true
      if (e.isFinal) this.framesDragging = false
    },
    framesLayerCenter () {
      this.$log('framesLayerCenter width:', this.width)
      this.$log('framesLayerCenter layerDuration:', this.layerDuration)
      this.$log('framesLayerCenter layerStart:', this.layerStart)
      this.$log('framesLayerCenter framesWidth:', this.framesWidth)
      let layerLeft = ((this.layerStart / this.player.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = (this.layerDuration / this.player.duration) * this.framesWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerItemFramesScrollArea, 0.5, {scrollLeft: scrollLeft})
    }
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
