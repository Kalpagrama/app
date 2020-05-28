<template lang="pug">
.column.full-width
  div().row.full-width.q-pa-sm
    span.text-white.text-bold Chain editor
  .col.full-width
</template>

<script>
export default {
  name: 'wsChainEditor',
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
