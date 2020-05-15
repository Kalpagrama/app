<template lang="pug">
div(
  :style=`{
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.full-width.b-50
  div(:style=`{height: '50px'}`).row.full-width.items-center.content-content-center.q-px-md
    span.text-white.text-bold Trending spheres
  .col.full-width
    sphere-list-top(:oid="$route.params.oid" @oid="$router.push({params: {oid: $event}})")
</template>

<script>
export default {
  name: 'trendsExplorer-menuRight',
  data () {
    return {
    }
  }
}
</script>
