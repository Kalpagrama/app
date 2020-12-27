<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-footer(
    :style=`{
      paddingBottom: 'env(safe-area-inset-bottom)',
    }`)
    div(
      :style=`{
        height: '65px',
      }`
      ).row.full-width.br
  q-page-container
    q-page
      content-player(
        :contentKalpa="contentKalpa"
        :style=`{
          height: $q.screen.height-65+'px',
        }`
        ).full-width
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'explorerBook',
  props: ['contentKalpa', 'query'],
  components: {
    contentPlayer,
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
