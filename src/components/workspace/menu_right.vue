<style lang="sass" scoped>
.menu-item
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.full-width.b-50
  //- .col.full-width.scroll
  .row.full-width.items-start
    router-link(
      :to="p.id"
      v-for="(p,pi) in pages" :key="pi"
      :class=`{
        'b-100': $route.params.page === p.id
      }`
      :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.menu-item.q-px-md
      span(
        :class=`{
        }`
        :style=`{
          fontSize: '16px'
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
