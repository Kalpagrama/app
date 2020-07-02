<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: pageFullscreen ? $q.screen.width+'px' : pageMinWidth+'px',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).column.full-width
  q-btn(
    round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')"
    :style=`{
      position: 'absolute', zIndex: 1000, top: 0, left: 0,
      background: 'rgba(0,0,0,0.1)',
    }`)
  //- player
  div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).col.full-width
    ws-content-player(
      :content="content")
  //- something
  //- .col.full-width.br
  div(:style=`{height: '60px'}`).row.full-width
</template>

<script>
export default {
  name: 'imageExplorer',
  props: ['content'],
  data () {
    return {
      pageFullscreen: false,
    }
  },
  computed: {
    pageMinWidth () {
      if (this.$q.screen.width > 800) return 800
      else return this.$q.screen.width
    },
  }
}
</script>
