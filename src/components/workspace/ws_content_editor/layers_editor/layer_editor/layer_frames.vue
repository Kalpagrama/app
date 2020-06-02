<template lang="pug">
div(
  ref="layerItemFramesScrollArea"
  :style=`{}`).row.full-width.scroll.q-py-md
  q-resize-observer(@resize="e => width = e.width")
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
        borderRadius: '10px',
      }`).row.no-wrap.items-center.content-center.justify-start.b-220
      //- frames
      div(
        v-for="(f,fi) in frames" :key="fi"
        :style=`{
          height: '50px', width: '50px', pointerEvents: 'none',
          borderRight: fi === frames-1 ? 'none' : '1px solid rgb(120,120,120)',
        }`
        ).row.items-center.content-center.justify-center
        span(:style=`{userSelect: 'none'}`).text-grey-8 {{ $time(((fi*frameWidth)/framesWidth)*meta.duration) }}
      //- now
      div(
        v-show="!poingDragging"
        :style=`{
          position: 'absolute', zIndex: 200,
          left: 'calc('+(meta.now/meta.duration)*100+'% - 0px)',
          top: '-16px',
          height: 'calc(100% + 32px)',
          width: '4px',
          borderRadius: '4px', overflow: 'hidden',
          pointerEvents: 'none'
        }`
        ).bg-grey-9
      //- left tint
      div(
        :style=`{
          position: 'absolute', zIndex: 100,
          left: '0px',
          width: 'calc('+(layer.figuresAbsolute[0].t/meta.duration)*100+'% + 8px)',
          height: '50px', background: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          borderRadius: '10px',
        }`)
      //- left drag
      div(
        v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 0)"
        :style=`{
          position: 'absolute', zIndex: 310, top: '0px',
          left: 'calc('+(layer.figuresAbsolute[0].t/meta.duration)*100+'% - 25px)',
          height: '50px', width: '50px',
          borderRadius: '50%',
          opacity: 0.3,
        }`
        ).bg-green
      //- right tint
      div(
        :style=`{
          position: 'absolute', zIndex: 100,
          left: 'calc('+(layer.figuresAbsolute[1].t/meta.duration)*100+'% - 0px)',
          width: 'calc('+((meta.duration-layer.figuresAbsolute[1].t)/meta.duration)*100+'% + 1px)',
          height: '50px', background: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          borderRadius: '10px',
        }`)
      //- right drag
      div(
        v-touch-pan.left.right.prevent.mouse="e => pointDrag(e, 1)"
        :style=`{
          position: 'absolute', zIndex: 320, top: '0px',
          left: 'calc('+(layer.figuresAbsolute[1].t/meta.duration)*100+'% - 25px)',
          height: '50px', width: '50px',
          borderRadius: '50%',
          opacity: 0.3,
        }`
        ).bg-green
      //- rect
      div(
        :style=`{
          position: 'absolute', zIndex: 300, top: '-8px',
          left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
          width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'% + 8px)',
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
  props: ['player', 'meta', 'layer'],
  data () {
    return {
      width: 0,
      frameWidth: 50,
      framesDragging: false,
      pointDragging: false,
      pointDraggingIndex: null,
      pointDraggingError: false,
      screenDuration: 60
    }
  },
  computed: {
    frames () {
      // TODO: this.duration/10 ?
      return Math.round((this.width * 2) / this.frameWidth)
    },
    framesWidth () {
      return this.frames * this.frameWidth
      // return (this.meta.duration * this.width) / this.screenDuration
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t
    }
  },
  watch: {
    // mode: {
    //   handler (to, from) {
    //     if (to === 'edit') {
    //       this.framesDragToLayer()
    //     }
    //   }
    // }
  },
  methods: {
    async pointDrag (e, index) {
      // if (this.pointDraggingError) return
      // this.$log('pointDrag', e, index)
      let t = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.meta.duration)
      if (t > this.meta.duration || t < 0) return
      // this.$log('t', t)
      if (index === 0) {
        if (t >= this.layerEnd) {
          // alert('t >= this.layerEnd')
          this.pointDraggingError = true
          return
        }
      }
      if (index === 1) {
        if (t <= this.layerStart) {
          this.pointDraggingError = true
          // alert('t <= this.layerStart')
          return
        }
      }
      this.player.setCurrentTime(t)
      this.player.update(t)
      this.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        this.player.meta(['timeupdateStop', true])
        this.pointDragging = true
        this.pointDraggingIndex = index
        this.player.pause()
        // this.$emit('meta', ['editing', true])
      }
      if (e.isFinal) {
        this.player.meta(['timeupdateStop', false])
        this.pointDragging = false
        this.pointDraggingIndex = null
        // this.player.play()
        // this.player.setCurrentTime(t)
        // TODO: where to go after drag event
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        // this.$emit('meta', ['editing', false])
        // TODO: if layerwidth > this.width?
        await this.$wait(300)
        this.framesDragToLayer()
        this.pointDraggingError = false
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
      let layerLeft = ((this.layer.figuresAbsolute[0].t / this.meta.duration) * this.framesWidth) + (this.width / 2)
      let layerWidth = ((this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t) / this.meta.duration) * this.framesWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerItemFramesScrollArea, 0.5, {scrollLeft: scrollLeft})
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX)
      if (e.target.accessKey !== 'frames') return
      let t = e.offsetX / this.framesWidth * this.meta.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      this.player.update(t)
      if (t < this.meta.layerStart || t > this.meta.layerEnd) {
        this.player.meta(['mode', 'content'])
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.framesDragToLayer()
  }
}
</script>
