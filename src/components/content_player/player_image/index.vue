<template lang="pug">
.row.full-width
  img(
    draggable="false"
    :src="contentKalpa.url"
    :style=`{
      maxHeight: $q.screen.height*0.8+'px',
      borderRadius: '10px',
      objectFit: 'contain',
    }`
    ).full-width.b-40
</template>

<script>
export default {
  name: 'wsContentPlayer__playerImage',
  props: ['contentKalpa'],
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
