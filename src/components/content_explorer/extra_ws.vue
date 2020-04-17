<template lang="pug">
div(:style=`{paddingTop: '60px'}`).column.fit
  //- header
  .row.full-width.justify-center
    div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.content-center.q-px-md
      span.text-bold.text-white What in your workspace here
  //- body
  .col.full-width.scroll
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-center
      //- span.text-white extra ws
</template>

<script>
export default {
  name: 'contentExplorer_extraWs',
  data () {
    return {
    }
  }
}
</script>
