<style lang="sass" scoped>
.menu-item
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(
  :class=`{
    'full-height': inDrawer
  }`
  :style=`{
    borderRadius: '10px'
  }`
  ).column.full-width.b-50
  div(
    :style=`{minHeight: '70px'}`
    ).row.full-width.items-center.content-center.q-pa-md
    span.text-white.text-bold Content explorer
    small.text-white.full-width {{contentName}}
  .col.full-width.scroll
    .row.full-width.items-start
      router-link(
        :to="{params: {page: p.id}}"
        v-for="(p,pi) in pages" :key="pi"
        :class=`{
          'b-100': $route.params.page === p.id
        }`
        :style=`{
          height: '50px', borderRadius: '10px', overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.menu-item.q-px-md
        span(
          :class=`{
          }`
          ).text-white {{ p.name }}
</template>

<script>
export default {
  name: 'menuRight',
  props: ['inDrawer', 'contentName'],
  data () {
    return {
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'users', name: 'People'},
        {id: 'ws', name: 'Workspace'}
      ]
    }
  }
}
</script>
