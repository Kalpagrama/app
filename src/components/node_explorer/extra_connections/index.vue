<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  .row.full-width
    span.text-white extra connections
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'nodeExplorer_extraConnections',
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
