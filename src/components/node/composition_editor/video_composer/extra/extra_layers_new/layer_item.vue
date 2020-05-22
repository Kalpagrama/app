<template lang="pug">
div(
  :class=`{
    'b-90': height < 100,
    'b-100': height > 50
  }`
  :style=`{
    position: 'relative',
    height: height+'px',
    borderBottom: layerIsLast ? 'none' : '1px solid rgb(50,50,50)',
    borderRadius: layersView === 'line' ? '0px' : '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-start.content-start
  //- preview minibar
  div(:style=`{position: 'absolute', top: '0px', height: '8px', borderRadius: '4px', overflow: 'hidden', pointerEvents: 'none'}`).row.full-width.b-100
    div(
      :style=`{
        position: 'absolute', top: '0px', zIndex: 100,
        left: (layer.figuresAbsolute[0].t/meta.duration)*100+'%',
        width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/meta.duration)*100+'%',
        borderRadius: '4px', overflow: 'hidden',
        background: layer.color,
        pointerEvents: 'none',
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
  div(v-if="true"
    ref="layerItemFramesScrollArea"
    :style=`{}`).row.full-width.scroll.q-py-md
    .row.items-start.content-start.no-wrap
      div(:style=`{height: '50px', width: width/2+'px'}`)
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
      div(:style=`{height: '50px', width: width/2+'px'}`)
  //- actions
  div(
    v-if="true"
    :style=`{height: '70px'}`).row.full-width.items-center.content-center.q-px-sm.br
    q-btn(round flat color="white" icon="play_arrow" @click="layerPlay()").b-110.q-mr-sm
    q-btn(round flat color="white" icon="refresh" @click="layerPlayAgain()").b-110
    .col
    q-btn(round flat color="white" icon="keyboard_arrow_up" @click="layerClose()").b-110
  //- debug
  div(
    v-if="false"
    :style=`{height: '50px', width: '50%'}`).row.full-width.bg-red
    //- small frames: {{frames}}
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
      heightMax: 190,
      frameWidth: 50,
      framesDragging: false,
      poingDragging: false,
      poingDraggingIndex: null
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
            if (this.height === this.heightMin) {
              this.$tween.to(this, 0.5, {height: this.heightNormal})
            }
            this.framesDragToLayer()
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
      this.framesDragToLayer()
    },
    layerNameClick () {
      this.$log('layerNameClick')
    },
    layerClose () {
      this.$log('layerClose')
      this.$tween.to(this, 0.5, {height: this.heightNormal})
      this.$emit('meta', ['mode', 'watch'])
      this.$emit('meta', ['layerIndexPlay', -1])
    },
    layerPlay () {
      this.$log('layerPlay')
      this.player.pause()
      this.$emit('meta', ['mode', 'layer'])
      this.$emit('meta', ['layerIndex', this.layerIndex])
      this.$emit('meta', ['layerIndexPlay', this.layerIndex])
      this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
      this.player.update(this.layer.figuresAbsolute[0].t)
      this.player.play()
    },
    layerPlayAgain () {
      this.$log('layerPlayAgain')
      this.layerPlay()
    },
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
      if (this.$q.screen.width < 600) return
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
