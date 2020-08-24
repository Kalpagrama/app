<template lang="pug">
div(
  @click="barClick"
  v-touch-pan.mouse.left.right="barPan"
  :style=`{position: 'relative', borderRadius: '10px',}`
  ).row.fit.items-center.content-center.justify-between.b-90
  //- stats
  div(
    :style=`{
      position: 'absolute', zIndex: 110,
      pointerEvents: 'none', userSelect: 'none',
    }`
    ).row.fit.items-center.content-center.justify-between.q-px-sm
    small.text-black {{$time(layerStart)}}
    small.text-black {{$time(layerDuration)}}
    small.text-black {{$time(layerEnd)}}
  //- progress
  div(
    v-if="player.currentTime >= layerStart && player.currentTime <= layerEnd"
    :style=`{
      position: 'absolute', zIndex: 100, left: '0px',
      width: (player.currentTime-layerStart)/layerDuration*100+'%',
      borderRadius: '10px 0 0 10px',
      pointerEvents: 'none',
    }`
    ).row.full-height.b-180
  //- bar right red line currentTime
  div(
    :style=`{
      position: 'absolute', zIndex: 120, top: '-4px',
      left: 'calc('+(player.currentTime-layerStart)/layerDuration*100+'% - 2px)',
      height: 'calc(100% + 8px)', width: '4px',
      borderRadius: '2px',
      pointerEvents: 'none',
    }`).row.bg-red
</template>

<script>
export default {
  name: 'layerEditor__layerBar',
  props: ['layer', 'player', 'layerStart', 'layerEnd', 'layerDuration'],
  data () {
    return {
      progressPercentRaw: null,
    }
  },
  methods: {
    barClick (e) {
      // this.$log('barClick', e)
      let width = e.target.clientWidth
      let left = e.offsetX
      let t = ((this.layerDuration * left) / width) + this.layerStart
      // this.$log('t', t)
      this.player.setCurrentTime(t)
      // tween to
      let tPercentNow = ((this.player.currentTime - this.layerStart) / this.layerDuration) * 100
      let tPercentNext = ((t - this.layerStart) / this.layerDuration) * 100
      this.progressPercentRaw = tPercentNow
      this.$tween.to(this, 0.1, {
        progressPercentRaw: tPercentNext,
        onComplete: () => {
          this.progressPercentRaw = null
          this.player.setCurrentTime(t)
        }
      })
    },
    barPan (e) {
      // this.$log('barPan', e)
      if (e.isFirst) {
        // this.$log('barPan isFirst')
        // this.player.pause()
        let left = e.position.left - this.$el.getBoundingClientRect().left
        this.progressPercentRaw = (left / this.$el.clientWidth) * 100
      }
      if (e.isFinal) {
        // this.$log('barPan isFinal')
        this.progressPercentRaw = null
      }
      if (!this.progressPercentRaw) return
      this.progressPercentRaw += (e.delta.x / this.$el.clientWidth) * 100
      let t = this.layerStart + (this.progressPercentRaw / 100) * this.layerDuration
      // this.$log('t', t)
      if (t < this.layerStart || t > this.layerEnd || t < 0 || t > this.player.duration) return
      this.player.setCurrentTime(t)
    }
  }
}
</script>
