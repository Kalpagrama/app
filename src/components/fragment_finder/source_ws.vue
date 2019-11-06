<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold Take from workspace
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.full-width.scroll
    div(:style=`{paddingBottom: '70px'}`).row.full-width.items-start.content.start.q-px-md.q-pt-md
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
