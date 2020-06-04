<template lang="pug">
.column.fit
  //- header
  div().row.full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-60
        .row.full-width.q-pa-md
          span.text-white.text-bold {{ name }}
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
  },
  computed: {
    name () {
      let compositionName = this.statePlayer.composition.name
      if (compositionName.length === 0) {
        if (this.statePlayer.composition.layers[0].spheres.length > 0) {
          return this.statePlayer.composition.layers[0].spheres[0].name
        }
        else {
          return ''
        }
      }
      else {
        return compositionName
      }
    }
  },
}
</script>
