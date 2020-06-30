<style lang="sass" scoped>
.page-item
  &:hover
    background: rgb(70,70,70) !important
</style>

<template lang="pug">
div(
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
  }`
  ).column.full-width.b-50
  //- pages
  router-link(
    v-for="(p,pi) in pages" :key="p.id"
    :to=`{name: p.id}`
    :class=`{
      'b-100': $route.name === p.id
    }`
    :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px'}`).row.full-width.items-center.content-center.q-px-md.page-item
    span(:style=`{userSelect: 'none'}`).text-white {{ p.name }}
</template>

<script>
export default {
  name: 'userExplorer-menuRight',
  props: ['user', 'pages'],
  data () {
    return {
    }
  }
}
</script>
