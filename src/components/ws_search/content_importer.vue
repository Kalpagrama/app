<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container).b-30
  q-header(reveal)
    .row.full-width.q-pt-sm.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageMaxWidth+'px', height: '60px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-40
        .col.q-px-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold Add content
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    q-page.row.full-width.items-start.content-start.q-pa-sm
      div(:style=`{position: 'relative',}`).row.full-width
        img(
          :src="contentKalpa.thumbUrl"
          draggable="false"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
            //- height: 'auto',
            opacity: 0.1,
            objectFit: 'contain',
            maxHeight: ($q.screen.height*0.8)-60+'px',
          }`
          ).full-width
        content-player(
          :contentKalpa="contentKalpa"
          :style=`{
            position: 'absolute', zIndex: 100, top: '0px',
            borderRadius: '10px', overflow: 'hidden',
          }`).fit
      .row.full-width.items-center.content-center.q-py-sm.br
        .col
        q-btn(color="green" no-caps)
          span.text-white.text-bold Добавить
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'contentImporter',
  props: {
    contentKalpa: {type: Object, required: true},
  },
  components: {
    contentPlayer
  },
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
