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
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
