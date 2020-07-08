<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: -1, top: '-46px',
    transform: 'translate3d(0,0,0)',
    height: '30px',
    pointerEvents: 'none',
    opacity: 0.5,
  }`).row.full-width
  //- v-if="layerId ? l.id === layerId : true"
  div(
    v-for="(l,li) in layers" :key="l.id"
    :style=`{
      position: 'absolute', zIndex: 1000,
      left: l.figuresAbsolute[0].t/duration*100+'%',
      width: (l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/duration*100+'%',
      height: '100%',
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
  }
}
</script>
