<style lang="sass" scoped>
.page-item
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(
  :class=`{
    'full-height': inDrawer
  }`
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
  }`
  ).column.full-width.b-50
  //- header
  div(:style=`{height: '70px'}`).row.full-width.items-center.content-center.q-px-md
    span.text-white.text-bold {{$t('Node explorer')}}
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      router-link(
        v-for="(p,pi) in pages" :key="p.id"
        :to=`{name: p.id}`
        :class=`{
          'b-100': $route.name === p.id,
        }`
        :style=`{height: '50px', borderRadius: $store.state.ui.borderRadius+'px'}`).row.full-width.items-center.content-center.q-px-md.page-item
        span.text-white {{ $t(p.name) }}
</template>

<script>
// different modes of nodeExplorer page
// pages: explore, chains, people, content, edit(fork...)

export default {
  name: 'nodeExplorer-menuRight',
  props: ['inDrawer'],
  data () {
    return {
      pageId: null,
      pages: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'contents', name: 'Contents'},
        {id: 'chains', name: 'Chains'}
      ]
    }
  }
}
</script>
