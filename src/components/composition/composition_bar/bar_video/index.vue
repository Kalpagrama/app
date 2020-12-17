<template lang="pug">
.row.full-width.items-start.content-start
  //- bar
  div(
    @click="barClick"
    :style=`{
      position: 'relative',
      borderRadius: '10px',
    }`
    ).row.fit.br
</template>

<script>
export default {
  name: 'compositionBar_video',
  props: {
    isActive: {
      type: Boolean, default () { return true },
    },
    player: {type: Object, required: true},
    composition: {type: Object, required: true},
    contentKalpa: {type: Object, required: true}
  },
  data () {
    return {
      compositionPlaying: true
    }
  },
  computed: {
    compositionStart () {
      return this.composition.layers[0].figuresAbsolute[0].t
    },
    compositionEnd () {
      return this.composition.layers[0].figuresAbsolute[1].t
    },
    compositionDuration () {
      return this.compositionEnd - this.compositionStart
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.compositionPlaying) return
        if (to >= this.compositionEnd) {
          this.player.setCurrentTime(this.compositionStart)
        }
        if (to < this.compositionStart) {
          this.player.setCurrentTime(this.compositionStart)
        }
      }
    }
  },
  methods: {
    compositionPlay () {
      this.$log('compositionPlay')
      this.compositionPlaying = true
      this.layerPlaying = 0
      let t = this.composition.layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
      this.player.play()
    },
    barClick (e) {
      this.$log('barClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      this.$log('left/width', left, width)
    }
  },
  mounted () {
    this.$log('mounted')
    this.compositionPlay()
  },
  beforeDestroy () {
  }
}
</script>
