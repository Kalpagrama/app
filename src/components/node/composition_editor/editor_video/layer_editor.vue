<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-center.content-center
  q-resize-observer(@resize="onResize")
  div(:style=`{position: 'relative'}`).row.full-width
    //- debug
    div(
      v-if="false"
      :style=`{position: 'absolute', top: '-100', zIndex: 10000}`
      ).row.full-width.bg-green
      small.text-white.full-width width: {{width}}
    div(
      ref="framesScrollWrapper"
      :style=`{height: '66px'}`).row.full-width.items-center.scroll
      div(v-touch-pan.left.right.prevent.mouse="$q.screen.width > 600 ? panFrames : false").row.no-wrap
        //- left padding
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
        //- frames
        div(:style=`{position: 'relative', borderRadius: '10px'}`).row.no-wrap
          //- frames images from kalpa
          div(v-if="content.contentSource === 'KALPA'").row.no-wrap
            img(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)" @load="frameLoaded"
              :src="f" draggable="false"
              :style=`{height: '50px', userSelect: 'none'}`)
          //- frames boxes for youtube
          div(v-else).row.no-wrap
            div(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :style=`{height: '50px', width: '50px', borderLeft: fi === 0 ? 'none' : '1px solid grey'}`
              ).row.items-center.justify-center.bg-grey-5
              small(:style=`{userSelect: 'none', pointerEvents: 'none'}`).cursor-pointer {{ $time((parseInt(((fi+1)*frameDuration)*100))/100) }}
          //- layers tints
          div(
            v-for="(l, li) in layers" :key="li"
            v-if="li !== layerIndex"
            :style=`{
              position: 'absolute', height: '50px', background: $randomColor(li),
              pointerEvents: 'none', opacity: 0.5,
              left: (l.figuresAbsolute[0].t/duration)*100+'%',
              width: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/duration)*100+'%'}`).row
          //- left tint
          div(
            :style=`{position: 'absolute', left: 0, top: 0, height: '50px',
              width: 'calc( '+(layer.figuresAbsolute[0].t/duration)*100+'% + 6px )',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
          //- middle layers
          div(
            :style=`{
              position: 'absolute', zIndex: 100, height: '66px', top: '-8px',
              left: (layer.figuresAbsolute[0].t/duration)*100+'%',
              width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/duration)*100+'%',
              borderRadius: '16px', border: '8px solid '+ $randomColor(layerIndex), pointerEvents: 'none'}`).row.br
          //- now second
          div(
            :style=`{position: 'absolute', zIndex: 300, height: '50px', top: '0px',
              left: (now/duration)*100+'%', borderRadius: '2px',
              width: '4px', pointerEvents: 'none'}`).row.bg-green
          //- layer start
          div(
            v-touch-pan.left.right.prevent.mouse="panStart"
            :style=`{position: 'absolute', zIndex: 101, top: 0,
              left: 'calc('+ (layer.figuresAbsolute[0].t/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%', cursor: 'grab'}`).row.bg-green
          //- layer end
          div(
            v-touch-pan.left.right.prevent.mouse="panEnd"
            :style=`{position: 'absolute', zIndex: 102, top: 0,
              left: 'calc('+ (layer.figuresAbsolute[1].t/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%', cursor: 'grab'}`).row.bg-green
          //- right tint
          div(
            :style=`{position: 'absolute', right: 0, top: 0, height: '50px',
              width: 'calc( '+((duration-layer.figuresAbsolute[1].t)/duration)*100+'% + 8px )',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
        //- right padding
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
</template>

<script>
export default {
  name: 'layerEditor',
  props: ['layers', 'layer', 'layerIndex', 'player', 'now'],
  data () {
    return {
      width: 0,
      panning: false,
      panningFrames: false,
      framesWidth: 0,
      framesLoadedCount: 0,
      framesLoaded: false
    }
  },
  computed: {
    k () {
      if (this.framesWidth === 0) return 1
      else {
        return this.duration / this.framesWidth
      }
    },
    duration () {
      return this.content.duration
    },
    content () {
      return this.layer.content
    },
    frames () {
      if (this.content.contentSource === 'KALPA') {
        return this.content.frameUrls.filter((f, fi) => {
          // return fi % 2 === 0
          return true
        })
      } else {
        return Math.ceil(this.duration / 10)
      }
    },
    framesCount () {
      if (this.content.contentSource === 'KALPA') {
        return this.frames.length
      } else {
        return this.frames
      }
    },
    frameDuration () {
      return this.duration / this.framesCount
    }
  },
  watch: {
    framesLoaded: {
      handler (to, from) {
        this.$log('framesLoaded', to)
        // TODO: show loading until all the frames are loaded...
        // moving strange(
        if (to) this.framesWidthUpdate()
      }
    },
    layer: {
      immediate: false,
      handler (to, from) {
        this.$log('layer CHANGED', to)
        if (to) {
          this.framesWidthUpdate()
          // TODO: wrong tween px...
          this.$tween.to(this.$refs.framesScrollWrapper, 0.9, {scrollLeft: (to.figuresAbsolute[0].t / this.k) + this.$refs.framesScrollWrapper.clientWidth / 2 - 50})
          this.player.setCurrentTime(to.figuresAbsolute[0].t)
        }
      }
    }
  },
  methods: {
    frameClick (f, fi, e) {
      this.$log('frameClick', fi)
      this.$log('layerX', e.layerX)
      let to = (fi * this.frameDuration) + (this.frameDuration / 2)
      this.player.setCurrentTime(to)
    },
    frameLoaded () {
      // this.$log('frameLoaded')
      this.framesLoadedCount += 1
      if (this.framesLoadedCount === this.framesCount) {
        this.framesLoaded = true
      }
    },
    framesWidthUpdate () {
      this.$log('framesWidthUpdate')
      this.framesWidth = this.$refs.framesScrollWrapper.scrollWidth - this.$refs.framesScrollWrapper.clientWidth
    },
    panFrames (e) {
      if (this.panning) return
      if (this.$q.screen.width < 800) return
      // this.$log('panFrames', e)
      this.$refs.framesScrollWrapper.scrollLeft -= e.delta.x
      if (e.isFirst) this.panningFrames = true
      if (e.isFinal) this.panningFrames = false
    },
    panStart (e) {
      // this.$log('panStart', e)
      let to = this.layer.figuresAbsolute[0].t + (e.delta.x * this.k)
      if (to >= 0 && to < this.layer.figuresAbsolute[1].t && to <= this.duration) {
        this.player.setCurrentTime(to)
        // this.layer.figuresAbsolute[0].t = to
        this.$set(this.layer.figuresAbsolute[0], 't', to)
      }
      if (e.isFirst) this.panning = true
      if (e.isFinal) this.panning = false
    },
    panEnd (e) {
      // this.$log('panEnd', e)
      let to = this.layer.figuresAbsolute[1].t + (e.delta.x * this.k)
      if (to >= 0 && to > this.layer.figuresAbsolute[0].t && to <= this.duration) {
        this.player.setCurrentTime(to)
        // this.layer.figuresAbsolute[1].t = to
        this.$set(this.layer.figuresAbsolute[1], 't', to)
      }
      if (e.isFirst) this.panning = true
      if (e.isFinal) {
        this.panning = false
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
      }
    },
    onResize (e) {
      this.$log('onResize', e.width)
      this.width = e.width
    }
  },
  async mounted () {
    this.$log('mounted')
    this.width = this.$el.clientWidth
    await this.$wait(1000)
    this.framesWidth = this.$refs.framesScrollWrapper.scrollWidth - this.$refs.framesScrollWrapper.clientWidth
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
