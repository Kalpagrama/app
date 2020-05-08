<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  .row.full-width
    span.text-white extraSpheres
  //- body
  .col.full-width.scroll
    .row.full-width
</template>

<script>
export default {
  name: 'videoComposer-extraNodes',
  data () {
    return {
    }
  }
}
</script>
