<template lang="pug">
.row.full-width
  span nodeMasonry
</template>

<script>
export default {
  name: 'nodeMasonry',
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
