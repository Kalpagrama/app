<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="e => width = e.width")
  //- kalpa-debug(:options=`{width,framesCount,framesWidth,frameWidth}`)
  div(
    ref="layerItemFramesScrollArea"
    :style=`{}`).row.full-width.scroll.q-py-xl
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
            left: 'calc('+(storePlayer.currentTime/storePlayer.duration)*100+'% - 0px)',
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
            width: 'calc('+(layer.figuresAbsolute[0].t/storePlayer.duration)*100+'% + 8px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- left drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
          :style=`{
            position: 'absolute', zIndex: 310, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[0].t/storePlayer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- right tint
        div(
          :style=`{
            position: 'absolute', zIndex: 100,
            left: 'calc('+(layer.figuresAbsolute[1].t/storePlayer.duration)*100+'% - 0px)',
            width: 'calc('+((storePlayer.duration-layer.figuresAbsolute[1].t)/storePlayer.duration)*100+'% + 1px)',
            height: '50px', background: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            borderRadius: $store.state.ui.borderRadius+'px',
          }`)
        //- right drag
        div(
          v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
          :style=`{
            position: 'absolute', zIndex: 320, top: '0px',
            left: 'calc('+(layer.figuresAbsolute[1].t/storePlayer.duration)*100+'% - 25px)',
            height: '50px', width: '50px',
            borderRadius: '50%',
            opacity: 0.3,
          }`
          ).bg-green
        //- rect
        div(
          :style=`{
            position: 'absolute', zIndex: 300, top: '-8px',
            left: (layer.figuresAbsolute[0].t/storePlayer.duration)*100+'%',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/storePlayer.duration)*100+'% + 8px)',
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
  name: 'layerEditor-layerFrames',
  props: ['storeEditor', 'storePlayer', 'storeLayerEditor', 'layer'],
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
      if (this.storePlayer.duration > 90) res = 60
      else res = 10
      return res
    },
    framesCount () {
      return Math.round(this.storePlayer.duration / 10)
    },
    framesWidth () {
      let widthFrames
      let widthScreen = this.width * 0.7
      let durationScreen = this.durationScreen
      let duration = this.storePlayer.duration
      // durationScreen === widthScreen
      // duration === x
      widthFrames = (duration * widthScreen) / durationScreen
      return widthFrames
    },
    frameWidth () {
      let widthFrame
      let widthFrames = this.framesWidth
      let durationFrame = 10
      let duration = this.storePlayer.duration
      // durationFrame === *widthFrame*
      // duration == widthFrames
      widthFrame = (widthFrames * durationFrame) / duration
      return widthFrame
    },
  },
  watch: {
    'storeLayerEditor.need_framesLayerCenter': {
      handler (to, from) {
        if (to) {
          this.$log('storeLayerEditor.need_framesLayerCenter TO', to)
          this.framesLayerCenter()
          this.storeLayerEditor.set('need_framesLayerCenter', false)
        }
      }
    }
  },
  methods: {
    async pointDrag (e, index) {
      // if (this.pointDraggingError) return
      // this.$log('pointDrag', e, index)
      let t = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.storePlayer.duration)
      if (t > this.storePlayer.duration || t < 0) return
      // this.$log('t', t)
      if (index === 0) {
        if (t >= this.storeLayerEditor.layerEnd) {
          this.pointDraggingError = true
          return
        }
      }
      if (index === 1) {
        if (t <= this.storeLayerEditor.layerStart) {
          this.pointDraggingError = true
          return
        }
      }
      this.storePlayer.setCurrentTime(t)
      this.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        // this.stateExplorer.set('timeupdateStop', true)
        this.storeEditor.layerPlaying = null
        this.pointDragging = true
        this.pointDraggingIndex = index
        // this.storePlayer.playPause()
        this.storePlayer.player.pause()
        // this.stateExplorer.set('editing', true)
      }
      if (e.isFinal) {
        // this.stateExplorer.set('timeupdateStop', false)
        this.pointDragging = false
        this.pointDraggingIndex = null
        // this.stateExplorer.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        // this.stateExplorer.set('editing', false)
        // TODO: if layerwidth > this.width?
        this.storeEditor.layerPlaying = this.layer.id
        await this.$wait(300)
        this.framesLayerCenter()
        this.pointDraggingError = false
      }
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX, e.target.accessKey)
      if (e.target.accessKey !== 'frames') return
      this.storeEditor.layerPlaying = null
      let t = e.offsetX / this.framesWidth * this.storePlayer.duration
      this.$log('t', t)
      this.storePlayer.setCurrentTime(t)
      // play layer if got this frames...
      if (t < this.storeLayerEditor.layerStart || t > this.storeLayerEditor.layerEnd) {
        this.storeEditor.layerPlaying = null
      }
      else {
        this.storeEditor.layerPlaying = this.layer.id
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
      let layerLeft = ((this.layer.figuresAbsolute[0].t / this.storePlayer.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = ((this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t) / this.storePlayer.duration) * this.framesWidth
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
