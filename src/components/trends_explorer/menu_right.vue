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
  div(:style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-md
    span(:style=`{fontSize: '20px', userSelect: 'none'}`).text-white.text-bold {{$t('Trends')}}
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
