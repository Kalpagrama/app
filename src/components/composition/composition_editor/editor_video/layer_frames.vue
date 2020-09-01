<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- overflowY: 'hidden',
  div(
    ref="layerItemFramesScrollArea"
    :style=`{paddingTop: '50px', paddingBottom: '50px'}`).row.full-width.scroll
    .row.items-start.content-start.no-wrap
      //- left margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
      //- center
      div(
        @click="framesClick"
        v-touch-pan.left.right.prevent.mouse="$q.screen.width > 600 ? framesDrag : false"
        accessKey="frames"
        :style=`{
          position: 'relative',
          height: '50px',
          borderRadius: $store.state.ui.borderRadius+'px',
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
        div(
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
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 30px)',
            height: '50px', width: '50px',
            cursor: 'grabbing',
            borderRadius: '50%',
            opacity: 0.5,
          }`
          ).bg-green
        //- right tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% - 0px)',
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
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% - 10px)',
            height: '50px', width: '50px',
            cursor: 'grabbing',
            borderRadius: '50%',
            opacity: 0.5,
          }`
          ).bg-green
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-8px',
            left: (layer.figuresAbsolute[0].t/player.duration)*100+'%',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration)*100+'% + 8px)',
            height: 50+8+8+'px',
            borderRadius: '12px',
            border: '8px solid rgb(76,175,80)',
            pointerEvents: 'none',
          }`)
        //- meta
        div(:style=`{
          position: 'absolute', zIndex: 400, top: '-8px',
          left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% + 0px)',
          width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration)*100+'% + 8px)',
          height: 50+8+8+'px',
          }`).row
          slot(name="meta" :panning="pointDragging")
          //- slot(name="meta")
        //- start actions
        div(
          :style=`{
            position: 'absolute', zIndex: 300, bottom: '-46px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 60px)',
            width: 'calc('+(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/player.duration*100+'% + 120px)',
          }`
          ).row.items-center.content-center.no-wrap
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
            ) {{$time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)}}
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
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
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
    }
  },
  computed: {
    durationScreen () {
      let res
      if (this.player.duration > 90) res = 60
      else res = 10
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
      widthFrames = (duration * widthScreen) / durationScreen
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
        this.$store.commit('ui/stateSet', ['wsContentLayers', [JSON.parse(JSON.stringify(to))]])
      }
    },
    tickFramesLayerCenter: {
      handler (to, from) {
        if (to) {
          this.$log('tickFramesLayerCenter TO', to)
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
      }
      this.player.play()
      // center frames
      await this.$wait(300)
      this.framesLayerCenter()
    },
    layerForward (pointIndex, goingForward) {
      this.$log('layerForward', pointIndex, goingForward)
      let t = this.layer.figuresAbsolute[pointIndex].t
      if (goingForward) t += 0.1
      else t -= 0.1
      this.$log('t', t)
      this.$set(this.layer.figuresAbsolute[pointIndex], 't', t)
      if (pointIndex === 0) {
        this.player.setCurrentTime(t)
        // this.player.play()
      }
      if (pointIndex === 1) {
        this.player.setCurrentTime(t)
        // this.player.setCurrentTime(t - 1)
        // this.player.play()
      }
      // TODO: at the end of clicking this.framesLayerCenter(), end go to -1 if the end...
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
        this.pointDragging = true
        this.pointDraggingIndex = index
        // this.player.pause()
      }
      if (e.isFinal) {
        this.pointDragging = false
        this.pointDraggingIndex = null
        await this.$wait(300)
        this.framesLayerCenter()
        this.pointDraggingError = false
      }
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      let t = e.offsetX / this.framesWidth * this.player.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      // play layer if got this frames...
      if (t > this.layerStart && t < this.layerEnd) {
        this.$emit('clickInside')
      }
      else {
        this.$emit('clickOutside')
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
      this.$log('framesLayerCenter')
      let layerLeft = ((this.layerStart / this.player.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = (this.layerDuration / this.player.duration) * this.framesWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerItemFramesScrollArea, 0.5, {scrollLeft: scrollLeft})
    }
  },
  mounted () {
    this.$log('mounted')
    this.framesLayerCenter()
  }
}
</script>
