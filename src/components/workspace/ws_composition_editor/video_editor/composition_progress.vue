<template lang="pug">
.row.full-width
  //- tools
  .row.full-width
    q-btn(
      round flat dense color="white"
      icon="play_arrow")
    .col
    q-btn(
      @click="pageFullscreen = !pageFullscreen"
      round flat dense color="white"
      :icon="pageFullscreen ? 'fullscreen_exit' : 'fullscreen'")
  //- bar
  div(
    :style=`{
      position: 'relative',
      height: '50px'
    }`).row.full-width.q-pa-sm.bg-red
    div(:style=`{}`).row.full-width
    slot(name="meta")
</template>

<script>
export default {
  name: 'compositionProgress',
  props: ['statePlayer', 'composition'],
}
</script>
