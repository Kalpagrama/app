<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  .row.full-width
    span.text-white extra stats
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'nodeExplorer_extraStats',
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
