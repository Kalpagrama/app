<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- kalpa-debug(:options=`{width,framesCount,framesWidth,frameWidth}`)
  div(
    ref="layerItemFramesScrollArea"
    :style=`{}`).row.full-width.scroll.q-py-md
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
        div(:style=`{minWidth: framesWidth+'px', width: framesWidth+'px', height: '50px', pointerEvents: 'none', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`).row
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
            left: 'calc('+(stateExplorer.currentTime/stateExplorer.duration)*100+'% - 0px)',
            top: '-16px',
            height: 'calc(100% + 32px)',
            width: '4px',
            borderRadius: '4px', overflow: 'hidden',
            pointerEvents: 'none'
          }`
          ).bg-red
        //- left tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: '0px',
            width: 'calc('+(stateExplorer.layer.figuresAbsolute[0].t/stateExplorer.duration)*100+'% + 8px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(stateExplorer.layer.figuresAbsolute[0].t/stateExplorer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- right tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc('+(stateExplorer.layer.figuresAbsolute[1].t/stateExplorer.duration)*100+'% - 0px)',
            width: 'calc('+((stateExplorer.duration-stateExplorer.layer.figuresAbsolute[1].t)/stateExplorer.duration)*100+'% + 1px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(stateExplorer.layer.figuresAbsolute[1].t/stateExplorer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-8px',
            left: (stateExplorer.layer.figuresAbsolute[0].t/stateExplorer.duration)*100+'%',
            width: 'calc('+((stateExplorer.layer.figuresAbsolute[1].t-stateExplorer.layer.figuresAbsolute[0].t)/stateExplorer.duration)*100+'% + 8px)',
            height: 50+8+8+'px',
            borderRadius: '12px',
            border: '8px solid '+stateExplorer.layer.color,
            pointerEvents: 'none',
          }`)
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
</template>

<script>
export default {
  name: 'layerEditor-layerFrames',
  props: ['stateExplorer', 'stateLayerEditor'],
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
      if (this.stateExplorer.duration > 90) res = 60
      else res = 10
      return res
    },
    framesCount () {
      return Math.round(this.stateExplorer.duration / 10)
    },
    framesWidth () {
      let widthFrames
      let widthScreen = this.width * 0.7
      let durationScreen = this.durationScreen
      let duration = this.stateExplorer.duration
      // durationScreen === widthScreen
      // duration === x
      widthFrames = (duration * widthScreen) / durationScreen
      return widthFrames
    },
    frameWidth () {
      let widthFrame
      let widthFrames = this.framesWidth
      let durationFrame = 10
      let duration = this.stateExplorer.duration
      // durationFrame === *widthFrame*
      // duration == widthFrames
      widthFrame = (widthFrames * durationFrame) / duration
      return widthFrame
    },
  },
  watch: {
  },
  methods: {
    async pointDrag (e, index) {
      // if (this.pointDraggingError) return
      // this.$log('pointDrag', e, index)
      let t = this.stateExplorer.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.stateExplorer.duration)
      if (t > this.stateExplorer.duration || t < 0) return
      // this.$log('t', t)
      if (index === 0) {
        if (t >= this.stateExplorer.layerEnd) {
          this.pointDraggingError = true
          return
        }
      }
      if (index === 1) {
        if (t <= this.stateExplorer.layerStart) {
          this.pointDraggingError = true
          return
        }
      }
      this.stateExplorer.player.setCurrentTime(t)
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        this.stateExplorer.set('timeupdateStop', true)
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.stateExplorer.player.pause()
        this.stateExplorer.set('editing', true)
      }
      if (e.isFinal) {
        this.stateExplorer.set('timeupdateStop', false)
        this.pointDragging = false
        this.pointDraggingIndex = null
        this.stateExplorer.player.setCurrentTime(this.stateExplorer.layer.figuresAbsolute[0].t)
        this.stateExplorer.set('editing', false)
        // TODO: if layerwidth > this.width?
        await this.$wait(300)
        this.framesDragToLayer()
        this.pointDraggingError = false
      }
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      let t = e.offsetX / this.framesWidth * this.stateExplorer.duration
      this.$log('t', t)
      this.stateExplorer.player.setCurrentTime(t)
      this.stateExplorer.set('currentTime', t)
      if (t < this.stateExplorer.layerStart || t > this.stateExplorer.layerEnd) {
        this.stateExplorer.set('mode', 'content')
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
    framesDragToLayer () {
      this.$log('framesDragToLayer')
      let layerLeft = ((this.stateExplorer.layer.figuresAbsolute[0].t / this.stateExplorer.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = ((this.stateExplorer.layer.figuresAbsolute[1].t - this.stateExplorer.layer.figuresAbsolute[0].t) / this.stateExplorer.duration) * this.framesWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerItemFramesScrollArea, 0.5, {scrollLeft: scrollLeft})
    }
  },
  mounted () {
    this.$log('mounted')
    this.framesDragToLayer()
  }
}
</script>
