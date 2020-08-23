<template lang="pug">
div(
  :class=`{'q-px-lg': $q.screen.width < 800}`
  ).row.full-width
  slot(name="header")
  div(:style=`{position: 'relative', height: '46px',}`).row.full-width
    div(
      @click="barClick"
      :style=`{
        position: 'absolute', top: '0px', zIndex: 100,
        borderRadius: '10px',
        height: '46px',
      }`).row.full-width.b-100
      //- currentTime width
      div(
        :style=`{
          position: 'absolute', zIndex: 100, left: '0px',
          width: currentTimePercent+'%',
          borderRadius: '10px 0 0 10px', overflow: 'hidden',
          pointerEvents: 'none',
        }`
        ).row.full-height.bg-grey-4
      //- cuurentTime line
      div(
        :style=`{
          position: 'absolute', zIndex: 1000,
          left: currentTimePercent+'%',
          pointerEvents: 'none',
          top: '-4px', height: 'calc(100% + 8px)',
          width: '4px', borderRadius: '2px',
        }`
        ).row.bg-red
      //- currentTimeFuture
      div(
        :style=`{
          position: 'absolute', zIndex: 90, left: '0px',
          width: currentTimeFuturePercent+'%',
          borderRadius: '10px 0 0 10px', overflow: 'hidden',
          pointerEvents: 'none',
        }`
        ).row.full-height.b-100
      //- bars
      div(
        v-if="barsShow"
        v-for="(b, bi) in bars" :key="b"
        :style=`{
          position: 'absolute', zIndex: 110, transform: 'translate3d(0,0,0)',
          left: b/player.duration*100+'%',
          width: '2px', opacity: 0.8,
          pointerEvents: 'none',
        }`
        ).row.full-height.bg-green
</template>

<script>
export default {
  name: 'contentBar',
  props: ['player', 'bars', 'barsShow'],
  data () {
    return {
      currentTimeFuture: 0,
    }
  },
  computed: {
    currentTimePercent () {
      // if (!this.contentPlayer) return 0
      return (this.player.currentTime / this.player.duration) * 100
    },
    currentTimeFuturePercent () {
      // if (!this.contentPlayer) return 0
      return (this.currentTimeFuture / this.player.duration) * 100
    }
  },
  methods: {
    barClick (e) {
      this.$log('barClick', e)
      // if (!this.contentPlayer) return
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      this.$log('left/width', left, width)
      let t = (left / width) * this.player.duration
      this.$log('t', t)
      this.currentTimeFuture = t
      this.player.setCurrentTime(t)
    }
  }
}
</script>
