<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: -1, top: '-46px',
    transform: 'translate3d(0,0,0)',
    height: '30px',
    pointerEvents: 'none',
  }`).row.full-width.justify-center
  div(:style=`{position: 'relative', maxWidth: barWidth+'px'}`).row.full-width
    div(
      v-for="(l,li) in layers" :key="l.id"
      :style=`{
        position: 'absolute', zIndex: 1000,
        left: l.figuresAbsolute[0].t/duration*100+'%',
        width: (l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/duration*100+'%',
        height: '100%',
        opacity: layerId ? l.id === layerId ? 0.9 : 0.5 : 0.5,
        background: l.color,
      }`)
</template>

<script>
export default {
  name: 'layersOnBar',
  props: ['layerId', 'layers', 'currentTime', 'duration'],
  data () {
    return {
    }
  },
  computed: {
    barWidth () {
      if (this.$q.screen.width > 600) return 600
      else return this.$q.screen.width - 80
    }
  }
}
</script>
