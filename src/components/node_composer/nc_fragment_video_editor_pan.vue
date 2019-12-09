<style lang="stylus">
// .mejs__overlay-button: {
//   display: none !important;
// }
</style>
<template lang="pug">
div(:style=`{position: 'relative', minHeight: '100px'}`).row.full-width.items-center.content-center
  div(v-if="cut" :style=`{position: 'absolute', top: 0, zIndex: 500, height: '10px',
    paddingLeft: '52px', paddingRight: '60px'}`).row.full-width
    div(:style=`{position: 'relative', borderRadius: '2px'}`).row.full-width.bg-grey-6
      div(:style=`{
        position: 'absolute',
        zIndex: 600,
        background: $randomColor(cut.name),
        left: (cut.start/content.duration)*100+'%',
        height: '10px',
        borderRadius: '2px',
        width: ((cut.end-cut.start)/content.duration)*100+'%'}`).row
  div(v-if="content.contentSource === 'KALPA'").row.full-width
    div(
      ref="framesScrollWrapper"
      :style=`{height: '70px'}`).row.full-width.items-center.scroll
      .row.no-wrap
        div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
          img(
            v-for="(f,fi) in frames" :key="fi" @click="$event => frameClick(f, fi, $event)"
            :src="f" draggable="false"
            :style=`{height: '50px', userSelect: 'none'}`)
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
              borderRadius: '4px', border: '4px solid '+ $randomColor(cut.name), pointerEvents: 'none'}`).row
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
  div(
    v-else
    :style=`{height: '50px'}`).row.full-width.q-px-md
    div(:style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.justify-center.bg-grey-10
      div(:style=`{height: '50px'}`).row.items-center.justify-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_left" @click="tickLeft")
      .col.full-height
        div(
          v-touch-pan.left.right.prevent.mouse="handlePan"
        ).row.fit.items-center.justify-center
          span.text-grey-5 {{ $t('Pan to select point') }}
      div(:style=`{height: '50px'}`).row.items-center.justify-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_right" @click="tickRight")
</template>

<script>
export default {
  name: 'ncFragmentVideoEditorPan',
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
      return this.content.frameUrls.filter((f, fi) => {
        // return fi % 2 === 0
        return true
      })
    },
    framesCount () {
      return this.content.frameUrls.length
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
        if (from) {
          if (to.name !== from.name) {
            this.$tween.to(this.$refs.framesScrollWrapper, 0.3, {scrollLeft: (to.start / this.k) + this.width / 2})
          }
        } else {
          this.$tween.to(this.$refs.framesScrollWrapper, 0.3, {scrollLeft: (to.start / this.k) + this.width / 2})
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
