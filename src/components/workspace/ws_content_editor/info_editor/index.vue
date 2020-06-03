<template lang="pug">
.column.fit
  //- header
  div().row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-60
        .row.full-width.q-pa-md
          span.text-white.text-bold {{ statePlayer.composition.name }}
        .row.full-width.q-pa-md
          span.text-white Spheres
        .row.full-width.q-pa-md
          q-btn(no-caps color="red") Delete content
</template>

<script>
export default {
  name: 'infoEditor',
  props: ['stateEditor', 'statePlayer', 'player'],
  data () {
    return {
    }
  }
}
</script>
