<template lang="pug">
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
        span(:style=`{userSelect: 'none'}`).text-grey-8 {{ fi }}
      //- now
      div(
        v-show="!poingDragging"
        :style=`{
          position: 'absolute', zIndex: 200,
          left: 'calc('+(meta.now/meta.duration)*100+'% - 0px)',
          height: '100%', width: '8px', borderRadius: '4px', overflow: 'hidden',
          pointerEvents: 'none'
        }`
        ).bg-green
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
  name: 'layerItem-frames',
  props: ['player', 'meta', 'layer', 'width'],
  data () {
    return {
      frameWidth: 50,
      framesDragging: false,
      poingDragging: false,
      poingDraggingIndex: null,
    }
  },
  computed: {
    frames () {
      // TODO: this.duration/10 ?
      return Math.round((this.width * 2) / this.frameWidth)
    },
    framesWidth () {
      return this.frames * this.frameWidth
    }
  },
  methods: {
    async pointDrag (e, index) {
      // this.$log('pointDrag', e, index)
      let t = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.framesWidth) * this.meta.duration)
      if (t > this.meta.duration || t < 0) return
      if (index === 0) {
        if (t > this.layer.figuresAbsolute[1]) return
      }
      else if (index === 1) {
        if (t < this.layer.figuresAbsolute[0]) return
      }
      this.player.setCurrentTime(t)
      this.layer.figuresAbsolute[index].t = t
      if (e.isFirst) {
        this.poingDragging = true
        this.poingDraggingIndex = index
        this.player.pause()
        // this.$emit('meta', ['editing', true])
      }
      if (e.isFinal) {
        this.poingDragging = false
        this.poingDraggingIndex = null
        this.player.play()
        // this.player.setCurrentTime(t)
        // TODO: where to go after drag event
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        // this.$emit('meta', ['editing', false])
        // TODO: if layerwidth > this.width?
        await this.$wait(300)
        this.framesDragToLayer()
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
      this.$emit('meta', ['mode', 'watch'])
    },
  }
}
</script>
