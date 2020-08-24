<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- kalpa-debug(:options=`{width,framesCount,framesWidth,frameWidth}`)
  div(
    ref="layerItemFramesScrollArea"
    :style=`{overflowY: 'hidden',}`).row.full-width.scroll.q-py-md
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
        //- currentTime
        div(
          v-show="!poingDragging"
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
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[0].t/player.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
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
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[1].t/player.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
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
            //- border: '8px solid '+layer.color,
            border: '8px solid rgb(76,175,80)',
            pointerEvents: 'none',
          }`)
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
</template>

<script>
export default {
  name: 'layerEditor__layerFrames',
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
