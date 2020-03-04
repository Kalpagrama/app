<template lang="pug">
.column.fit
  //- div(:style=`{height: '60px'}`).row.full-width
  .col.full-width.scroll.q-pa-md
    span.text-white {{content.name}}
</template>

<script>
export default {
  name: 'contentExplorer_extraInfo',
  props: ['mode', 'content'],
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
