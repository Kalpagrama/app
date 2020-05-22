<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden'
  }`).column.fit
  //- header
  div(
    :style=`{height: '70px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.q-pa-sm.b-100
  //- body
  .col.full-width.scroll
    .row.full-width.items-center.content-center.q-pa-sm
  //- footer
</template>

<script>
export default {
  name: 'layerItem-nameEditor',
  props: ['layer'],
  data () {
    return {
      nameString: ''
    }
  },
  methods: {},
}
</script>
