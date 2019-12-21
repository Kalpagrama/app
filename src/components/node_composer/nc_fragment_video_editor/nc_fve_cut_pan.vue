<template lang="pug">
div(:style=`{position: 'relative', minHeight: '70px'}`).row.full-width.items-center.content-center
  .row.full-width
    div(
      ref="framesScrollWrapper"
      :style=`{height: '66px'}`).row.full-width.items-center.scroll
      .row.no-wrap
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
        div(:style=`{position: 'relative', borderRadius: '10px'}`).row.no-wrap
          //- frames images
          div(v-if="fragment.content.contentSource === 'KALPA'").row.no-wrap
            img(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :src="f" draggable="false"
              :style=`{height: '50px', userSelect: 'none'}`)
          //- frames boxes for youtube
          div(v-else).row.no-wrap
            div(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :style=`{height: '50px', width: '50px', borderLeft: fi === 0 ? 'none' : '1px solid grey'}`
              ).row.items-center.justify-center.bg-grey-5
              small(:style=`{userSelect: 'none', pointerEvents: 'none'}`).cursor-pointer {{ $time((parseInt(((fi+1)*frameDuration)*100))/100) }}
          //- cuts tints
          div(
            v-for="(c,ci) in fragment.cuts" :key="ci"
            v-if="ci !== cutIndex"
            :style=`{
              position: 'absolute', height: '50px', background: c.color,
              pointerEvents: 'none', opacity: 0.5,
              left: (c.points[0].x/duration)*100+'%',
              width: ((c.points[1].x-c.points[0].x)/duration)*100+'%'}`).row
          //- left tint
          div(
            v-if="cut"
            :style=`{position: 'absolute', left: 0, top: 0, height: '50px',
              width: 'calc( '+(cut.points[0].x/duration)*100+'% + 6px )',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
          //- middle fragments
          div(
            v-if="cut"
            :style=`{
              position: 'absolute', zIndex: 100, height: '66px', top: '-8px',
              left: (cut.points[0].x/duration)*100+'%',
              width: ((cut.points[1].x-cut.points[0].x)/duration)*100+'%',
              borderRadius: '16px', border: '8px solid '+ cut.color, pointerEvents: 'none'}`).row
          //- now second
          div(
            v-if="true"
            :style=`{position: 'absolute', zIndex: 99, height: '50px', top: '0px',
              left: (now/duration)*100+'%', borderRadius: '2px',
              width: '4px', pointerEvents: 'none'}`).row.bg-green
          //- cut start
          div(
            v-if="cut"
            v-touch-pan.left.right.prevent.mouse="panStart"
            :style=`{position: 'absolute', zIndex: 101, top: 0,
              left: 'calc('+ (cut.points[0].x/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%'}`).row.bg-green
            //- small {{cut.start}}
          //- cut end
          div(
            v-if="cut"
            v-touch-pan.left.right.prevent.mouse="panEnd"
            :style=`{position: 'absolute', zIndex: 102, top: 0,
              left: 'calc('+ (cut.points[1].x/duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%'}`).row.bg-green
            //- small {{cut.end}}
          //- right tint
          div(
            v-if="cut"
            :style=`{position: 'absolute', right: 0, top: 0, height: '50px',
              width: 'calc( '+((duration-cut.points[1].x)/duration)*100+'% + 8px )',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
</template>

<script>
export default {
  name: 'ncFveCutPan',
  props: ['width', 'player', 'node', 'fragment', 'cut', 'cutIndex', 'now', 'fragmentDuration'],
  data () {
    return {
      framesWidth: 0
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
      return this.fragment.content.duration
    },
    frames () {
      if (this.fragment.content.contentSource === 'KALPA') {
        return this.fragment.content.frameUrls.filter((f, fi) => {
          // return fi % 2 === 0
          return true
        })
      } else {
        return Math.ceil(this.duration / 10)
      }
    },
    framesCount () {
      if (this.fragment.content.contentSource === 'KALPA') {
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
    cut: {
      immediate: true,
      handler (to, from) {
        this.$log('cut CHANGED', to)
        if (this.framesWidth === 0 && this.$refs.framesScrollWrapper) this.framesWidth = this.$refs.framesScrollWrapper.scrollWidth - this.$refs.framesScrollWrapper.clientWidth
        if (to) {
          this.$tween.to(this.$refs.framesScrollWrapper, 0.9, {scrollLeft: (to.points[0].x / this.k) + this.$refs.framesScrollWrapper.clientWidth / 2 - 50})
          this.player.setCurrentTime(to.points[0].x)
        }
      }
    }
  },
  methods: {
    panStart (e) {
      this.$log('panStart', e)
      let to = this.cut.points[0].x + (e.delta.x * this.k)
      if (to >= 0 && to < this.cut.points[1].x && to <= this.duration) {
        this.player.currentTime = to
        this.cut.points[0].x = to
      }
    },
    panEnd (e) {
      this.$log('panEnd', e)
      let to = this.cut.points[1].x + (e.delta.x * this.k)
      if (to >= 0 && to > this.cut.points[0].x && to <= this.duration) {
        this.player.currentTime = to
        this.cut.points[1].x = to
      }
    },
    frameClick (f, fi, e) {
      this.$log('frameClick', fi)
      this.$log('layerX', e.layerX)
      this.player.currentTime = (fi * this.frameDuration) + (this.frameDuration / 2)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
