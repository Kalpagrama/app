<template lang="pug">
.row.full-width
  img(
    :src="contentKalpa.url"
    ).full-width
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
