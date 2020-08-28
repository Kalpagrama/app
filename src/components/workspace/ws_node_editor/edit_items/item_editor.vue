<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px', height: '50px'}`).row.full-width.items-center.content-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Item editor
  q-page-container
    q-page
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          //- small.text-white {{item}}
          //- ws-content-player(
            v-if="contentKalpa"
            :contentKalpa="contentKalpa"
            @player="player = $event"
            :options=`{
              showBar: false,
              showActions: false,
            }`
            :style=`{
              position: 'absolute', zIndex: 100,
            }`).fit
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'
import wsContentPlayer from 'components/ws_content_player/index.vue'

export default {
  name: 'editItems_itemEditor',
  components: {wsContentPlayer, compositionEditor},
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
