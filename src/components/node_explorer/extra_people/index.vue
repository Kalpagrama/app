<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  .row.full-width
    span.text-white extra people
  .col.full-width.scroll
  //- footer
  div(:style=`{height: '60px'}`).row.full-width
    kalpa-buttons(:value="tabs" :id="tab" @id="$emit('tab', $event)")
</template>

<script>
export default {
  name: 'nodeExplorer_extraPeople',
  props: ['node', 'tabs', 'tab'],
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
