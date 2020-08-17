<template lang="pug">
div(
  :class=`{
    'full-height': inDrawer
  }`
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50
  //- header
  div(:style=`{height: 'auto',}`).row.full-width.items-center.content-center.q-px-sm.q-py-md
    q-icon(name="whatshot" color="white" size="30px").q-mr-sm
    span(:style=`{fontSize: '20px', userSelect: 'none'}`).text-white.text-bold Горячие сферы сути
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
