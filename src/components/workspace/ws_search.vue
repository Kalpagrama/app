<style lang="stylus">
</style>
<template lang="pug">
.row.full-width
  span ws_search
</template>

<script>
export default {
  name: 'wsSearch',
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
