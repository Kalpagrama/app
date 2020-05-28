<template lang="pug">
.column.fit
  //- header
  div().row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.q-pa-sm
      h1.text-white info
  //- footer
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '10px 10px 0 0',
    }`
    ).row.full-width.items-end.content-end.q-pa-sm.b-70
    .col
    q-btn(
      round flat color="white" icon="menu_open" @click="$emit('menuToggle')"
      ).b-90
</template>

<script>
export default {
  name: 'editInfo',
  data () {
    return {
    }
  }
}
</script>
