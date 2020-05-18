<template lang="pug">
div(
  :class=`{
    'full-height': inDrawer
  }`
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.full-width.b-50
  //- header
  div(
    :style=`{height: '70px'}`
    ).row.full-width.items-center.content-content-center.q-px-md
    span.text-white.text-bold Trending spheres
  //- body
  .col.full-width.scroll
    sphere-list-top(:oid="$route.params.oid" @oid="$router.push({params: {oid: $event}})")
</template>

<script>
export default {
  name: 'trendsExplorer-menuRight',
  props: ['inDrawer'],
  data () {
    return {
    }
  }
}
</script>
