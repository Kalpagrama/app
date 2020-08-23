<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 1000, bottom: '0px', left: '0px', width: 'calc(100% - 0px)',
    pointerEvents: 'none',
    height: '3px', borderRadius: '3px',
  }`
  ).row.b-100
  div(
    :style=`{
      position: 'absolute', zIndex: 1100,
      left: '0px',
      width: (storePlayer.currentTime-storeLayerEditor.layerStart)/storeLayerEditor.layerDuration*100+'%',
      pointerEvents: 'none',
      borderRadius: '3px',
    }`
    ).row.full-height.bg-green
</template>

<script>
export default {
  name: 'layerProgressMini',
  props: ['layer', 'storeEditor', 'storePlayer', 'storeLayerEditor'],
  data () {
    return {
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
