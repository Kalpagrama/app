<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  .row.full-width
    span.text-white extra people
  .col.full-width.scroll
</template>

<script>
export default {
  name: 'nodeExplorer_extraPeople',
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
