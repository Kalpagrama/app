<template lang="pug">
//- .row
  div(
    :style=`{
      position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, zIndex: 1,
    }`
    ).row.fit
    content-player(
      @player="player = $event"
      :contentKalpa="contentKalpa"
      :style=`{
        height: '100%',
      }`
      :options=`{
        showHeader: false,
        showBar: true,
        showFooter: true,
        footerOverlay: true,
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`
      ).full-width.bg-black
  div(
    :style=`{
      position: 'relative', zIndex: 100,
      marginTop: $q.screen.height-0+'px'
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        borderRadius: '10px',
      }`).row.full-width.b-30.q-pa-sm
      div(v-for="n in 100" :key="n").row.full-width.br.q-pa-md.q-mb-sm item {{ n }}
.row.full-width
  div(
    :style=`{
      position: 'relative',
      height: $q.screen.height/2+'px',
    }`
    ).row.full-width
    content-player(
      @player="player = $event"
      :contentKalpa="contentKalpa"
      :style=`{
        height: '100%',
      }`
      :options=`{
        showHeader: false,
        showBar: true,
        showFooter: true,
        //- footerOverlay: true,
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`
      ).full-width.bg-black
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'layoutFixed',
  props: ['contentKalpa'],
  components: {
    contentPlayer,
  },
  data () {
    return {
    }
  }
}
</script>
