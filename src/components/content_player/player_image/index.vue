<template lang="pug">
div(
  :style=`{position: 'relative',}`
  ).row.full-width
  slot(name="bar")
  img(
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      maxHeight: $q.screen.height*0.5+'px',
      borderRadius: '10px',
      objectFit: 'contain',
      background: 'rgb(35,35,35)',
      ...styles
    }`
    ).full-width
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
