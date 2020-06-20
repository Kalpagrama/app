<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $store.state.ui.borderRadius+'px',
  }`
  ).column.fit.b-60
  //- header: composition.name, content.name, urls...
  .row.full-width.q-pa-md
    span(:style=`{fontSize: '20px'}`).text-white.text-bold {{ composition.name }}
    .row.full-width
      small.text-grey-4 {{ content.name }}
  .row.full-width
  //- body: spheres
  .col.full-width.scroll
    .row.fit.q-pa-md
      span.text-white {{ store.state.statePlayer.currentTime }}
  //- footer: delete, share
  .row.full-width.q-pa-sm
    q-btn(round flat dense color="red" icon="delete_outline")
    .col
    q-btn(round flat dense color="white" icon="share")
</template>

<script>
export default {
  name: 'videoEditor-pageDetails',
  props: ['composition', 'content'],
  inject: ['store', 'stateEditor'],
  data () {
    return {
    }
  }
}
</script>
