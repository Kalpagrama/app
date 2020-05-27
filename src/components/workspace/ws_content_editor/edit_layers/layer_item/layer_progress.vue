<template lang="pug">
div(
  @mouseenter="mouseOver = true"
  @mouseleave="mouseOver = false"
  :style=`{
    position: 'relative',
    height: '33px',
    paddingLeft: paddingX+'px',
    paddingRight: paddingX+'px',
    borderRadius: '10px',
    overflow: 'hidden',
  }`).row.full-width.items-center.content-center
  div(
    @click="progressClick"
    v-touch-pan.mouse.left.right="progressDrag"
    :style=`{
      position: 'relative',
      height: '20px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.b-140
    div(
      :style=`{
        position: 'absolute', zIndex: 1000,
        left: '0px',
        width: progressPercentRaw ? progressPercentRaw+'%' : progressPercent+'%',
        pointerEvents: 'none',
        borderRadius: '10px',
        overflow: 'hidden',
      }`
    ).row.full-height.bg-green
</template>

<script>
export default {
  name: 'layerProgress',
  props: ['meta', 'player', 'layer', 'layerIndex'],
  data () {
    return {
      paddingX: 46,
      mouseOver: false,
      progressPercentRaw: null,
      progressHeight: 0
    }
  },
  computed: {
    progressPercent () {
      return ((this.meta.now - this.layerStart) / this.layerDuration) * 100
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    }
  },
  methods: {
    progressClick (e) {
      this.$log('progressClick')
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = ((this.layerDuration * left) / width) + this.layerStart
      this.$log('t', t)
      this.player.setCurrentTime(t)
      this.player.update(t)
      // tween to
      let tPercentNow = ((this.meta.now - this.layerStart) / this.layerDuration) * 100
      let tPercentNext = ((t - this.layerStart) / this.layerDuration) * 100
      this.progressPercentRaw = tPercentNow
      this.$tween.to(this, 0.3, {
        progressPercentRaw: tPercentNext,
        onComplete: () => {
          this.progressPercentRaw = null
          this.player.update(t)
        }
      })
    },
    progressDrag (e) {
      this.$log('progressDrag', e)
      let width = this.$el.clientWidth - (this.paddingX * 2)
      if (e.isFirst) {
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMax})
        this.progressPercentRaw = (e.evt.layerX / width) * 100
      }
      if (e.isFinal) {
        // this.$tween.to(this, 0.3, {barHeight: this.barHeightMin})
        this.progressPercentRaw = null
      }
      this.progressPercentRaw += (e.delta.x / width) * 100
      let t = (this.progressPercentRaw / 100) * this.layerDuration
      if (t > 0) {
        this.player.setCurrentTime(t)
        this.player.update(t)
      }
    }
  }
}
</script>
