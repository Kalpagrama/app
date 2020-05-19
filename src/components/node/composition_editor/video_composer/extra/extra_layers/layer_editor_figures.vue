<template lang="pug">
.row.full-width.items-start.content-start
  q-resize-observer(@resize="onResize")
  //- debug
  div(v-if="false").row.full-width.q-pa-sm.text-white.bg-red
    small.full-width width: {{width}}
    small.full-width scrollLeft: {{scrollLeft}}
    small.full-width scrollWidth: {{scrollWidth}}
  div(
    ref="layerEditorScrollArea" @scroll="onScroll"
    :class=`{}`
    :style=`{position: 'relative', height: '80px'}`).row.full-width.items-end.content-end.scroll
    .row.items-center.content-center.no-wrap
      //- LEFT scroll padding
      div(:style=`{height: '70px', width: width/2+'px'}`)
      div(
        @click="framesClick"
        v-touch-pan.left.right.prevent.mouse="$q.screen.width > 600 ? panFrames : false"
        :style=`{
          position: 'relative',
          height: '50px',
          borderRadius: '10px',
        }`).row.no-wrap.items-center.content-center.justify-start.b-190
        //- frames
        div(
          v-for="(f,fi) in 50" :key="fi"
          :style=`{height: '50px', width: '50px', pointerEvents: 'none', borderRight: '1px solid rgb(120,120,120)'}`
          ).row.items-center.content-center.justify-center {{ fi }}
        //- now
        div(
          :style=`{
            position: 'absolute', zIndex: 1000,
            left: (meta.now/meta.duration)*100+'%',
            width: '4px', height: '50px',
            borderRadius: '2px', overflow: 'hidden',
            pointerEvents: 'none'
          }`
          ).bg-green
        //- layer START
        div(
          v-if="layer"
          :style=`{
            position: 'absolute', zIndex: 2000,
            left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
            width: '4px', height: '50px',
          }`
          ).row
          div(
            v-touch-pan.left.right.prevent.mouse="e => panStart(e, 0)"
            :style=`{
              position: 'absolute', top: '0px', left: '-25px', zIndex: 2100,
              width: '50px', height: '50px',
              borderRadius: '50%',
              opacity: 0.5
            }`
            ).row.bg-green
        //- layer END
        div(
          v-if="layer"
          :style=`{
            position: 'absolute', zIndex: 2000,
            left: (layer.figuresAbsolute[1].t/meta.duration)*100+'%',
            width: '4px', height: '50px',
          }`
          ).row
          div(
            v-touch-pan.left.right.prevent.mouse="e => panStart(e, 1)"
            :style=`{
              position: 'absolute', top: '0px', left: '-25px', zIndex: 2900,
              width: '50px', height: '50px',
              borderRadius: '50%',
              opacity: 0.5
            }`
            ).row.bg-green
        //- layer RECT
        div(
          v-if="layer"
          :style=`{
            position: 'absolute', top: '-8px', zIndex: 2000,
            left: 'calc('+(layer.figuresAbsolute[0].t/meta.duration)*100+'% - 8px)',
            width: 'calc('+((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'% + 16px)',
            height: 50+8+8+'px',
            border: '8px solid '+layer.color,
            borderRadius: '12px',
            pointerEvents: 'none'
          }`
          ).row
      //- RIGHT scroll padding
      div(:style=`{height: '70px', width: width/2+'px'}`)
</template>

<script>
export default {
  name: 'layerEditorFigures',
  props: ['player', 'meta'],
  data () {
    return {
      width: 0,
      scrollWidth: 0,
      scrollLeft: 0,
      layerCopy: null,
      panning: false,
      panningFrames: false
    }
  },
  computed: {
    frames () {
      return []
    },
    layer () {
      if (this.meta.layerIndexPlay >= 0) return this.layerCopy
      else return null
    }
  },
  watch: {
    'meta.layer': {
      deep: false,
      handler (to, from) {
        // this.$log('meta.layer CHANGED', to)
        // this.layerCopy = JSON.parse(JSON.stringify(to))
      }
    },
    'meta.layerIndexPlay': {
      immediate: true,
      handler (to, from) {
        this.$log('meta.layerIndexPlay CHANGED', to)
        if (to >= 0) {
          this.layerCopy = JSON.parse(JSON.stringify(this.meta.layers[to]))
          this.framesScrollToLayer()
        }
      }
    }
  },
  methods: {
    panFrames (e) {
      if (this.panning) return
      if (this.$q.screen.width < 600) return
      // this.$log('panFrames', e)
      this.$refs.layerEditorScrollArea.scrollLeft -= e.delta.x
      if (e.isFirst) this.panningFrames = true
      if (e.isFinal) this.panningFrames = false
    },
    panStart (e, index) {
      // this.$log('panStart', e)
      let to = this.layer.figuresAbsolute[index].t + ((e.delta.x / this.scrollWidth) * this.meta.duration)
      // TODO: min/max values of start/end
      if (to >= 0 && to <= this.meta.duration) {
        // if (index === 0 && to > this.layer.figuresAbsolute[1].t) {
        //   this.layer.figuresAbsolute[1].t = to
        // }
        // if (index === 1 && to < this.layer.figuresAbsolute[0].t) {
        //   this.layer.figuresAbsolute[0].t = to
        // }
        this.player.setCurrentTime(to)
        this.layer.figuresAbsolute[index].t = to
      }
      if (e.isFirst) {
        this.panning = true
        this.player.editing = true
        this.player.pause()
        this.$emit('meta', ['editing', true])
      }
      if (e.isFinal) {
        this.panning = false
        this.player.editing = false
        this.player.pause()
        this.player.setCurrentTime(to)
        this.$emit('meta', ['editing', false])
        this.$set(this.meta.layers, this.meta.layerIndexPlay, this.layerCopy)
        // this.framesScrollToLayer()
      }
    },
    framesClick (e) {
      this.$log('frameClick', e.offsetX)
      let t = e.offsetX / this.scrollWidth * this.meta.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      this.player.update(t)
      this.$emit('meta', ['mode', 'watch'])
    },
    framesScrollToLayer () {
      this.$log('framesScrollToLayer')
      if (!this.layer || !this.$refs.layerEditorScrollArea) return
      let layerLeft = ((this.layer.figuresAbsolute[0].t / this.meta.duration) * this.scrollWidth) + (this.width / 2)
      let layerWidth = ((this.layer.figuresAbsolute[1].t - this.layer.figuresAbsolute[0].t) / this.meta.duration) * this.scrollWidth
      let scrollLeft = layerLeft - (this.width - layerWidth) / 2
      this.$log('scrollLeft', scrollLeft)
      this.$tween.to(this.$refs.layerEditorScrollArea, 0.5, {scrollLeft: scrollLeft})
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollLeft = e.target.scrollLeft
      this.scrollWidth = e.target.scrollWidth - this.width
    },
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
      this.scrollWidth = this.$refs.layerEditorScrollArea.scrollWidth
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.layer) {
      this.framesScrollToLayer()
    }
  }
}
</script>
