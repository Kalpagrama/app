<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.full-width.bg-grey-9
  //- .col.full-width.scroll
  .row.full-width.items-start
    router-link(
      :to="p.id"
      v-for="(p,pi) in pages" :key="pi"
      :class=`{
        'bg-grey-7': $route.params.page === p.id
      }`
      :style=`{height: '40px'}`
      ).row.full-width.items-center.content-center.ws-menu-item.q-px-md
      span(
        :class=`{
        }`
        ).text-white {{ p.name }}
</template>

<script>
export default {
  name: 'workspace-menuRight',
  props: ['pages'],
  data () {
    return {
    }
  }
}
</script>
