<template lang="pug">
//- :class=`{'q-px-lg': $q.screen.width < 800}`
div(
  :class=`{'q-px-lg': $q.screen.width < 800}`
  ).row.full-width
  slot(name="header")
  div(:style=`{position: 'relative', height: '36px',}`).row.full-width
    div(
      @click="barClick"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 100,
        borderRadius: '10px', overflow: 'hidden',
        height: '36px',
      }`).row.full-width.b-60
      //- currentTime
      div(
        :style=`{
          position: 'absolute', zIndex: 100, left: '0px',
          width: currentTimePercent+'%',
          pointerEvents: 'none',
        }`
        ).row.full-height.b-150
      //- currentTimeFuture
      div(
        :style=`{
          position: 'absolute', zIndex: 90, left: '0px',
          width: currentTimeFuturePercent+'%',
          pointerEvents: 'none',
        }`
        ).row.full-height.b-100
      //- bars
      div(
        v-for="(b, bi) in bars" :key="b"
        :style=`{
          position: 'absolute', zIndex: 110, transform: 'translate3d(0,0,0)',
          left: b/contentPlayer.duration*100+'%',
          width: '2px', opacity: 0.8,
          pointerEvents: 'none',
        }`
        ).row.full-height.bg-green
</template>

<script>
export default {
  name: 'contentBar',
  props: ['contentPlayer', 'bars'],
  data () {
    return {
      currentTimeFuture: 0,
    }
  },
  computed: {
    currentTimePercent () {
      return (this.contentPlayer.currentTime / this.contentPlayer.duration) * 100
    },
    currentTimeFuturePercent () {
      return (this.currentTimeFuture / this.contentPlayer.duration) * 100
    }
  },
  methods: {
    barClick (e) {
      this.$log('barClick', e)
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      this.$log('left/width', left, width)
      let t = (left / width) * this.contentPlayer.duration
      this.$log('t', t)
      this.currentTimeFuture = t
      this.contentPlayer.player.setCurrentTime(t)
    }
  }
}
</script>
