<template lang="pug">
div(
  :class=`{
  }`
  :style=`{
    position: 'relative',
    height: height+50+'px',
    borderBottom: layerIsLast ? 'none' : '1px solid rgb(50,50,50)',
    borderRadius: layersView === 'line' ? '0px' : '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-start.content-start.b-90
  div(
    v-if="true"
    :style=`{
      position: 'absolute', top: '0px', zIndex: 100,
      left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
      width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'%',
      borderRadius: '4px', overflow: 'hidden',
      background: layer.color,
      height: '8px',
    }`
    ).row
  //- header
  div(
    v-if="true"
    @click="layerClickHeader()"
    :style=`{height: height > 44 ? 44+'px' : height+'px'}`
    ).row.full-width.items-center.content-center
    .col.full-height
      .row.fit.items-center.content-center.q-px-md
        span.text-white Layer name
    small.text-white {{ $time(layer.figuresAbsolute[0].t) }} -
    small.text-white.q-mx-xs {{ $time(layer.figuresAbsolute[1].t) }} /
    small.text-white.q-mr-sm {{ $time(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t) }}
  //- frames
  div(v-if="true && height >= 50"
    ref="layerItemFramesScrollArea").row.full-width.scroll
    //- div(:style=`{height: '70px', width: '50%'}`)
    div(
      @click="framesClick"
      :style=`{
        position: 'relative',
        height: '50px',
        borderRadius: '10px',
      }`).row.no-wrap.items-center.content-center.justify-start.b-190
      //- frames
      div(
        v-for="(f,fi) in frames" :key="fi"
        :style=`{
          height: '50px', width: '50px', pointerEvents: 'none',
          borderRight: fi === frames-1 ? 'none' : '1px solid rgb(120,120,120)',
        }`
        ).row.items-center.content-center.justify-center {{ fi }}
      //- now
      div(
        :style=`{
          position: 'absolute', zIndex: 200,
          left: (meta.now/meta.duration)*100+'%',
          height: '100%', width: '8px', borderRadius: '4px', overflow: 'hidden',
          pointerEvents: 'none'
        }`
        ).bg-green
      //- left drag
      div(
        :style=`{
          position: 'absolute', zIndex: 310, top: '0px',
          left: 'calc('+(layer.figuresAbsolute[0].t/meta.duration)*100+'% - 25px)',
          height: '50px', width: '50px',
          borderRadius: '50%',
          opacity: 0.3,
        }`
        ).bg-green
      //- right drag
      div(
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
          width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'%',
          height: 50+8+8+'px',
          borderRadius: '12px',
          border: '8px solid '+layer.color
        }`)
  //- debug
  div(:style=`{height: '50px', width: '50%'}`).row.full-width.bg-red
    small frames: {{frames}}
</template>

<script>
export default {
  name: 'extraLayers-layerItem',
  props: ['player', 'meta', 'layer', 'layerIndex', 'layerIsFirst', 'layerIsLast', 'layersView', 'width'],
  data () {
    return {
      view: 'mini',
      height: 44,
      heightMin: 26,
      heightNormal: 44,
      heightMax: 130,
      frameWidth: 50
    }
  },
  computed: {
    frames () {
      // let count = this.meta.duration / 10
      // let max = count * this.frameWidth
      // if (max < this.width) {
      //   return this.width
      // }
      // else {
      //   if (max > this.width * 2) return this.width * 2
      //   else return max
      // }
      return Math.round((this.width * 2) / this.frameWidth)
    }
  },
  watch: {
    view: {
      handler (to, from) {
        this.$log('view CHANGED', to)
      }
    },
    layersView: {
      immediate: true,
      handler (to, from) {
        this.$log('layersView', to)
        switch (to) {
          case 'line': {
            this.$tween.to(this, 0.5, {height: this.heightMin})
            break
          }
          case 'normal': {
            this.$tween.to(this, 0.5, {height: this.heightNormal})
            break
          }
        }
      }
    }
  },
  methods: {
    layerClickHeader () {
      this.$log('layerClickHeader')
      if (this.height === this.heightMax) {
        this.$tween.to(this, 0.5, {height: 44})
      }
      else {
        this.$tween.to(this, 0.5, {height: this.heightMax})
      }
    },
    framesDrag (e) {
      this.$log('framesDrag', e)
    },
    framesClick (e) {
      this.$log('framesClick', e.offsetX)
      let scrollWidth = this.$refs.layerItemFramesScrollArea.scrollWidth
      let t = e.offsetX / scrollWidth * this.meta.duration
      this.$log('t', t)
      this.player.setCurrentTime(t)
      // this.player.update(t)
      this.$emit('meta', ['mode', 'watch'])
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
