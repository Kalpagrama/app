<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: styles.height,
    }`
  ).row.full-width.items-start.content-start
  slot
  //- video wrapper
  content-player(
    v-if="true"
    @player="player = $event"
    :contentKalpa=`{
      oid: composition.layers[0].contentOid,
      name: composition.layers[0].contentName,
      url: composition.url,
      type: 'IMAGE',
      contentSource: 'KALPA',
    }`
    :figures="null"
    :styles=`{
      height: styles.height,
      objectFit: styles.objectFit,
    }`
    :options=`options`
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      //- borderRadius: '10px',
      //- opacity: (figures && player && (player.currentTime < figures[0].t || player.currentTime > figures[1].t)) ? 0 : 1
    }`).fit
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'compositionPlayer_Image',
  components: {
    contentPlayer
  },
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    styles: {type: Object, default: {}},
    options: {
      type: Object,
      default () {
        return {
        }
      }
    }
  },
  computed: {
  }
}
</script>
