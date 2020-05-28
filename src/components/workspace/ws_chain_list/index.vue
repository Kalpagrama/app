<template lang="pug">
div(
  :class=`{
    'q-pt-sm': $q.screen.gt.xs
  }`
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-md.b-50
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
    span(:style=`{fontSize: '20px'}`).text-white.text-bold Chains
  //- body
  .col.full-width.scroll
  //- footer
  div.row.full-width
</template>

<script>
export default {
  name: 'wsChainList',
  data () {
    return {
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
