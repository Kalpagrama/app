<template lang="pug">
.row.full-width.justify-start.q-px-md.q-mt-lg
  .row.full-width.q-pa-sm
    span.text-bold Take from workspace
  .row.full-width
    div(
      v-for="(s, si) in sources" :key="si"
      :style=`{height: '60px', borderRadius: '10px'}`
      ).row.full-width.items-center.q-px-md.bg-grey-2.q-mb-sm
      span {{ s.name }}
</template>

<script>
export default {
  name: 'fragmentFinder__sourceWs',
  data () {
    return {
      sources: [
        {name: 'Bookmarks', count: 12},
        {name: 'Contents', count: 15},
        {name: 'Fragments', count: 123},
        {name: 'Drafts', count: 13}
      ]
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
