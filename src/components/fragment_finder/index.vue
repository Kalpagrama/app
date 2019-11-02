<template lang="pug">
.row.full-width.bg-red
  span fragment finder from ws link or other shit
</template>

<script>
export default {
  name: 'fragmentFinder',
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
