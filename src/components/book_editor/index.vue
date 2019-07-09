<template lang="pug">
.column.fit.bg-white
</template>

<script>
export default {
  name: 'bookEditor',
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
