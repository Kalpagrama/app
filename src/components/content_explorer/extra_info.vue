<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width
  //- header
  .row.full-width.justify-center
    div(:style=`{minHeight: '70px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.q-pa-md
      span.text-bold.text-white {{ content.name }}
  //- body
  .col.full-width.scroll.q-pa-sm
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        //- .row.full-width.q-px-sm.q-py-sm
        //-   span.text-white.text-bold Spheres
        .row.full-width
          sphere-spheres(:oid="content.oid" :height="'200px'")
    div(:style=`{height: '300px'}`).row.full-width
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
