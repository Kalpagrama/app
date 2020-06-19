<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  kalpa-debug(:options=`{width,framesCount,framesWidth,frameWidth}`)
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
            span {{ $time((f - 1)*10) }}
            //- span(:style=`{userSelect: 'none'}`).text-grey-8 {{ $time(((fi*frameWidth)/framesWidth)*statePlayer.duration) }}
        //- now
        div(
          v-show="!poingDragging"
          :style=`{
            position: 'absolute', zIndex: 200,
            left: 'calc('+(statePlayer.now/statePlayer.duration)*100+'% - 0px)',
            top: '-16px',
            height: 'calc(100% + 32px)',
            width: '4px',
            borderRadius: '4px', overflow: 'hidden',
            pointerEvents: 'none'
          }`
          ).bg-grey-8
        //- left tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: '0px',
            width: 'calc('+(layer.figuresAbsolute[0].t/statePlayer.duration)*100+'% + 8px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[0].t/statePlayer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- right tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc('+(layer.figuresAbsolute[1].t/statePlayer.duration)*100+'% - 0px)',
            width: 'calc('+((statePlayer.duration-layer.figuresAbsolute[1].t)/statePlayer.duration)*100+'% + 1px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[1].t/statePlayer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-8px',
            left: (layer.figuresAbsolute[0].t/statePlayer.duration)*100+'%',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/statePlayer.duration)*100+'% + 8px)',
            height: 50+8+8+'px',
            borderRadius: '12px',
            border: '8px solid '+layer.color,
            pointerEvents: 'none',
          }`)
      //- right margin width/2
      div(:style=`{height: '50px', width: width/2+'px'}`)
</template>

<script>
export default {
  name: 'layerItem-layerFrames',
  props: ['player', 'statePlayer', 'layer'],
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
      if (this.statePlayer.duration > 90) res = 60
      else res = 10
      return res
    },
    framesCount () {
      return Math.round(this.statePlayer.duration / 10)
    },
    framesWidth () {
      let widthFrames
      let widthScreen = this.width * 0.7
      let durationScreen = this.durationScreen
      let duration = this.statePlayer.duration
      // durationScreen === widthScreen
      // duration === x
      widthFrames = (duration * widthScreen) / durationScreen
      return widthFrames
    },
    frameWidth () {
      let widthFrame
      let widthFrames = this.framesWidth
      let durationFrame = 10
      let duration = this.statePlayer.duration
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
      let t = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.statePlayer.duration)
      if (t > this.statePlayer.duration || t < 0) return
      // this.$log('t', t)
      if (index === 0) {
        if (t >= this.statePlayer.layerEnd) {
          this.pointDraggingError = true
          return
        }
      }
      if (index === 1) {
        if (t <= this.statePlayer.layerStart) {
          this.pointDraggingError = true
          return
        }
      }
      this.player.setCurrentTime(t)
      this.player.update(t)
      this.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        this.statePlayer.set('timeupdateStop', true)
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.player.pause()
        this.statePlayer.set('editing', true)
      }
      if (e.isFinal) {
        this.statePlayer.set('timeupdateStop', false)
        this.pointDragging = false
        this.pointDraggingIndex = null
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        this.statePlayer.set('editing', false)
        // TODO: if layerwidth > this.width?
        await this.$wait(300)
        this.framesDragToLayer()
        this.pointDraggingError = false
      }
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      let t = e.offsetX / this.framesWidth * this.statePlayer.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      this.player.update(t)
      if (t < this.statePlayer.layerStart || t > this.statePlayer.layerEnd) {
        this.statePlayer.set('mode', 'content')
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
      let layerLeft = ((this.layer.figuresAbsolute[0].t / this.statePlayer.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = ((this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t) / this.statePlayer.duration) * this.framesWidth
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
