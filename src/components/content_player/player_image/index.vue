<template lang="pug">
div(
  :style=`{position: 'relative',}`
  ).row.full-width
  slot(name="bar")
  img(
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      //- maxHeight: $q.screen.height*0.8+'px',
      borderRadius: '10px',
      objectFit: 'contain',
      ...styles
    }`
    ).full-width.b-40
</template>

<script>
export default {
  name: 'contentPlayer_image',
  props: ['contentKalpa', 'styles'],
  data () {
    return {
      currentPage: 0
    }
  },
  mounted () {
    this.$log('mounted')
    this.$emit('player', this)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
