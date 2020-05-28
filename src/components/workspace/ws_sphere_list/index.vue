<template lang="pug">
div(
  :class=`{
    'q-pt-sm': $q.screen.gt.xs
  }`
  :style=`{
    position: 'relative',
  }`
  ).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-md.b-50
    q-btn(round flat color="white" icon="keyboard_arrow_left").q-mr-sm
    span(:style=`{fontSize: '20px'}`).text-white.text-bold Spheres
  //- body
  .col.full-width.scroll
  //- footer
</template>

<script>
export default {
  name: 'wsSphereList',
  data () {
    return {
    }
  }
}
</script>
