<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit.items-center.content-center
  q-resize-observer(@resize="onResize")
  div(:style=`{position: 'relative'}`).row.fit
    //- debug, relative
    div(v-if="$store.state.ui.debug").row.full-width.q-pa-sm
      div(:style=`{borderRadius: '10px', color: 'white'}`).row.full-width.bg-green.q-pa-xs
        //- small.text-white.full-width layer: {{layer}}
        small.full-width width: {{width}}
        small.full-width framesWidth/framesLoaded: {{framesWidth}}/{{framesLoaded}}
    //- debug
    div(
      v-if="false"
      :style=`{position: 'absolute', bottom: '0px', zIndex: 10000}`
      ).row.full-width.bg-green
      small.text-white.full-width width: {{width}}
    //- layer NAME
    //- span(
    //-   v-if="false & layer.spheres.length > 0"
    //-   :style=`{position: 'absolute', zIndex: 1000, top: '10px', left: '10px', background: 'rgba(0,0,0,0.3)'}`
    //-   ).text-white.q-pa-sm {{ layer.spheres[0].name }}
    //- add layer
    //- q-btn(
    //-   v-if="content"
    //-   v-show="content.contentSource === 'KALPA' ? framesLoaded : true"
    //-   round push color="green" icon="add" @click="$emit('add')"
    //-   :style=`{position: 'absolute', zIndex: 5000, right: '16px', top: '12px'}`)
    //- frames
    div(
      ref="framesScrollWrapper"
      :style=`{position: 'relative', height: '100%'}`).row.full-width.items-center.scroll
      //- frames loading spinner tint
      div(
        v-if="content"
        v-show="content.contentSource === 'KALPA' ? !framesLoaded : false"
        :style=`{position: 'absolute', zIndex: 1000}`
        ).row.fit.items-center.content-center.justify-center.bg-black
        q-spinner(color="green" size="40px" :thickness="2")
      //- frames
      div(
        v-touch-pan.left.right.prevent.mouse="$q.screen.width > 600 ? panFrames : false").row.no-wrap
        //- left padding
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
        //- frames
        div(:style=`{position: 'relative', borderRadius: '10px'}`).row.no-wrap
          //- frames images from kalpa
          div(v-if="content.contentSource === 'KALPA'" :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
            img(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)" @load="frameLoaded"
              :src="f" draggable="false"
              :style=`{height: '50px', userSelect: 'none'}`)
          //- frames boxes for youtube
          div(v-else :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
            div(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :style=`{height: '50px', width: '50px', borderLeft: fi === 0 ? 'none' : '1px solid grey'}`
              ).row.items-center.justify-center.bg-white
              small(:style=`{userSelect: 'none', pointerEvents: 'none'}`).cursor-pointer {{ $time((parseInt((((fi+1)*frameDuration)-frameDuration/2)*100))/100) }}
          //- layers tints
          div(
            v-for="(l, li) in layers" :key="li"
            v-if="l.figuresAbsolute.length > 0 && li !== layerIndex"
            :style=`{
              position: 'absolute', height: '50px', background: $randomColor(li),
              pointerEvents: 'none', opacity: 0.1,
              left: (l.figuresAbsolute[0].t/duration)*100+'%',
              width: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/duration)*100+'%'}`).row
          //- left tint
          div(
            v-if="layer.figuresAbsolute.length > 0"
            :style=`{
              position: 'absolute', left: 0, top: 0, height: '50px',
              width: 'calc( '+(layer.figuresAbsolute[0].t/duration)*100+'% + 6px )',
              borderRadius: '10px 0 0 10px', overflow: 'hidden',
              opacity: 0.6, pointerEvents: 'none'
            }`).row.bg-black
          //- middle layers
          div(
            v-if="layer.figuresAbsolute.length > 0"
            :style=`{
              position: 'absolute', zIndex: 100, height: '66px', top: '-8px',
              left: (layer.figuresAbsolute[0].t/duration)*100+'%',
              width: ((layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t)/duration)*100+'%',
              borderRadius: '16px', border: '8px solid '+ $randomColor(layerIndex), pointerEvents: 'none'}`).row.br
          //- now second
          div(
            v-if="true"
            :style=`{position: 'absolute', zIndex: 300, height: '50px', top: '0px',
              left: (meta.now/meta.duration)*100+'%', borderRadius: '2px',
              width: '4px', pointerEvents: 'none'}`).row.bg-green
          //- layer start
          div(
            v-if="layer.figuresAbsolute.length > 0"
            v-touch-pan.left.right.prevent.mouse="panStart"
            :style=`{position: 'absolute', zIndex: 101, top: 0,
              left: 'calc('+ (layer.figuresAbsolute[0].t/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%', cursor: 'grab'}`).row.bg-green
          //- layer end
          div(
            v-if="layer.figuresAbsolute.length > 0"
            v-touch-pan.left.right.prevent.mouse="panEnd"
            :style=`{position: 'absolute', zIndex: 102, top: 0,
              left: 'calc('+ (layer.figuresAbsolute[1].t/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%', cursor: 'grab'}`).row.bg-green
          //- right tint
          div(
            v-if="layer.figuresAbsolute.length > 0"
            :style=`{
              position: 'absolute', right: 0, top: 0, height: '50px',
              width: 'calc( '+((duration-layer.figuresAbsolute[1].t)/duration)*100+'% + 8px )',
              borderRadius: '0 10px 10px 0 ', overflow: 'hidden',
              opacity: 0.6, pointerEvents: 'none'
            }`).row.bg-black
        //- right padding
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
</template>

<script>
export default {
  name: 'layerEditor',
  props: ['content', 'layers', 'layer', 'layerIndex', 'player', 'meta'],
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
      if (!this.content) return 0
      return this.content.duration
    },
    frames () {
      if (!this.content) return []
      if (this.content.contentSource === 'KALPA') {
        return this.content.frameUrls.filter((f, fi) => {
          // return fi % 2 === 0
          return true
        })
      } else {
        // TODO min max screen width
        return Math.ceil(this.duration / 10)
      }
    },
    framesCount () {
      if (!this.content) return 0
      if (this.content.contentSource === 'KALPA') {
        return this.frames.length
      } else {
        return this.frames
      }
    },
    frameDuration () {
      return this.duration / this.framesCount
    },
    nowShow () {
      if (this.meta.mode === 'watch') {
        return true
      }
      else {
        if (this.meta.now < this.meta.layerStart || this.meta.now > this.meta.layerEnd) return false
        else return true
      }
    }
  },
  watch: {
    framesLoaded: {
      handler (to, from) {
        this.$log('framesLoaded CHANGED', to)
        if (to) {
          this.framesWidthUpdate()
          this.framesTweenToLayer()
        }
      }
    },
    'meta.playing': {
      handler (to, from) {
        this.$log('meta.playing CHANGED', to)
        if (to) {
          // TODO maybe the meta.mode?
          // this.framesTweenToLayer()
        }
      }
    },
    'meta.layerIndexPlay': {
      immediate: true,
      handler (to, from) {
        if (to === from) return
        this.$log('meta.layerIndex CHANGED')
        this.framesWidthUpdate()
        if (this.layer && this.$refs.framesScrollWrapper) {
          this.framesTweenToLayer()
        }
        if (this.content && this.content.contentSource === 'YOUTUBE') this.framesLoaded = true
      }
    },
    layer: {
      deep: true,
      immediate: false,
      handler (to, from) {
        if (to) {
          // if (from && to === from) return
          // if (this.panning || this.panningFrames) return
          // this.$log('layer CHANGED', to)
          // this.framesWidthUpdate()
          // this.$tween.to(this.$refs.framesScrollWrapper, 0.9, {scrollLeft: (to.figuresAbsolute[0].t / this.k) + this.$refs.framesScrollWrapper.clientWidth / 2 - 50})
          // this.player.setCurrentTime(to.figuresAbsolute[0].t)
        }
      }
    }
  },
  methods: {
    frameClick (f, fi, e) {
      this.$log('frameClick', fi)
      this.$log('layerX', e.layerX)
      let to = (fi * this.frameDuration) + (this.frameDuration / 2)
      this.$emit('meta', ['mode', 'watch'])
      this.player.setCurrentTime(to)
      this.player.pause()
      this.player.update(to)
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
      if (this.$refs.framesScrollWrapper) this.framesWidth = this.$refs.framesScrollWrapper.scrollWidth - this.$refs.framesScrollWrapper.clientWidth
    },
    framesTweenToLayer () {
      this.$log('framesTweenToLayer start')
      if (!this.layer || this.layer.figuresAbsolute.length === 0) return
      this.$tween.to(
        this.$refs.framesScrollWrapper,
        0.9,
        {
          scrollLeft: (this.layer.figuresAbsolute[0].t / this.k) + this.$refs.framesScrollWrapper.clientWidth / 2 - 50,
          onComplete: () => {
            this.$log('framesTweenToLayer done')
          }
        })
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
        this.layer.figuresAbsolute[0].t = to
        // this.$set(this.layer.figuresAbsolute[0], 't', to)
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
        this.player.setCurrentTime(to)
        this.player.play()
        this.$emit('meta', ['editing', false])
      }
    },
    panEnd (e) {
      // this.$log('panEnd', e)
      let to = this.layer.figuresAbsolute[1].t + (e.delta.x * this.k)
      if (to >= 0 && to > this.layer.figuresAbsolute[0].t && to <= this.duration) {
        this.player.setCurrentTime(to)
        this.layer.figuresAbsolute[1].t = to
        // this.$set(this.layer.figuresAbsolute[1], 't', to)
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
        this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
        this.player.play()
        this.$emit('meta', ['editing', false])
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
