<template lang="pug">
div(:style=`{position: 'relative', minHeight: '70px'}`).row.full-width.items-center.content-center
  .row.full-width
    div(
      ref="framesScrollWrapper"
      :style=`{height: '70px'}`).row.full-width.items-center.scroll
      .row.no-wrap
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
          div(v-if="content.contentSource === 'KALPA'").row.no-wrap
            img(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :src="f" draggable="false"
              :style=`{height: '50px', userSelect: 'none'}`)
          div(v-else).row.no-wrap
            div(
              v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
              :style=`{height: '50px', width: '50px', borderLeft: fi === 0 ? 'none' : '1px solid grey'}`
              ).row.items-center.justify-center.bg-grey-8
              small {{ $time((parseInt(((fi+1)*frameDuration)*100))/100) }}
          //- left tint
          div(
            v-if="cut"
            :style=`{position: 'absolute', left: 0, top: 0, height: '50px',
              width: (cut.start/content.duration)*100+'%',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
          //- middle fragmens
          div(
            v-if="cut"
            :style=`{position: 'absolute', zIndex: 100, height: '50px', top: '0px',
              left: (cut.start/content.duration)*100+'%',
              width: ((cut.end-cut.start)/content.duration)*100+'%',
              borderRadius: '4px', border: '4px solid '+ $randomColor(cut.type), pointerEvents: 'none'}`).row
          //- cut start
          div(
            v-if="cut"
            v-touch-pan.left.right.prevent.mouse="panStart"
            :style=`{position: 'absolute', zIndex: 101, top: 0,
              left: 'calc('+ (cut.start/content.duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%'}`).row.bg-green
            //- small {{cut.start}}
          //- cut end
          div(
            v-if="cut"
            v-touch-pan.left.right.prevent.mouse="panEnd"
            :style=`{position: 'absolute', zIndex: 102, top: 0,
              left: 'calc('+ (cut.end/content.duration)*100+'%' +' - 25px)',
              width: '50px', height: '50px', opacity: 0.3, borderRadius: '50%'}`).row.bg-green
            //- small {{cut.end}}
          //- right tint
          div(
            v-if="cut"
            :style=`{position: 'absolute', right: 0, top: 0, height: '50px',
              width: ((content.duration-cut.end)/content.duration)*100+'%',
              opacity: 0.6, pointerEvents: 'none'}`).row.bg-black
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
</template>

<script>
export default {
  name: 'ncFVE_pan',
  props: ['width', 'player', 'node', 'content', 'cut'],
  data () {
    return {
      framesWidth: 0
    }
  },
  computed: {
    k () {
      if (this.framesWidth === 0) return 1
      else {
        return this.content.duration / this.framesWidth
      }
    },
    frames () {
      if (this.content.contentSource === 'KALPA') {
        return this.content.frameUrls.filter((f, fi) => {
          // return fi % 2 === 0
          return true
        })
      } else {
        return Math.ceil(this.content.duration / 10)
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
      return this.content.duration / this.framesCount
    }
  },
  watch: {
    cut: {
      immediate: true,
      handler (to, from) {
        this.$log('cut CHANGED', to)
        if (this.framesWidth === 0 && this.$refs.framesScrollWrapper) this.framesWidth = this.$refs.framesScrollWrapper.scrollWidth - this.width
        if (to) {
          if (from) {
            if (from.type !== to.type) {
              this.$tween.to(this.$refs.framesScrollWrapper, 0.3, {scrollLeft: (to.start / this.k) + this.width / 2 - 50})
              this.player.setCurrentTime(to.start)
            }
          } else {
            this.$tween.to(this.$refs.framesScrollWrapper, 0.3, {scrollLeft: (to.start / this.k) + this.width / 2 - 50})
            this.player.setCurrentTime(to.start)
          }
        }
      }
    }
  },
  methods: {
    panStart (e) {
      this.$log('panStart', e)
      let to = this.cut.start + (e.delta.x * this.k)
      if (to >= 0 && to < this.cut.end && to <= this.content.duration) {
        this.player.currentTime = to
        this.$emit('cut', {...this.cut, ...{start: to}})
      }
    },
    panEnd (e) {
      this.$log('panEnd', e)
      let to = this.cut.end + (e.delta.x * this.k)
      if (to >= 0 && to > this.cut.start && to <= this.content.duration) {
        this.player.currentTime = to
        this.$emit('cut', {...this.cut, ...{end: to}})
      }
    },
    frameClick (f, fi, e) {
      this.$log('frameClick', fi)
      this.$log('layerX', e.layerX)
      this.player.currentTime = (fi * this.frameDuration) + (this.frameDuration / 2)
    },
    handlePan (e) {
      this.$log('handlePan', e)
      let now = this.player.currentTime
      let to = now + (e.delta.x * 2)
      this.player.currentTime = to
    },
    tickLeft () {
      this.$log('tickLeft')
      let now = this.player.currentTime
      let to = now - 0.5
      this.player.currentTime = to
    },
    tickRight () {
      this.$log('tickRight')
      let now = this.player.currentTime
      let to = now + 0.5
      this.player.currentTime = to
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
