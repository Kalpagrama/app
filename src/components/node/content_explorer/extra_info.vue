<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`
    ).row.full-width.items-center.content-center.q-px-md
    span.text-bold.text-white {{ content.name }}
  .col.full-width.scroll.q-pa-sm
    .row.full-width.q-px-sm.q-py-sm
      span.text-white.text-bold Spheres
    .row.full-width
      sphere-spheres(:oid="content.oid" :height="'200px'")
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
