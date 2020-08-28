<template lang="pug">
component(
  :is="barComponent[composition.outputType]"
  :composition="composition"
  :contentKalpa="contentKalpa"
  :player="player"
  :actionsPosition="actionsPosition"
  )
</template>

<script>
import barVideo from './bar_video/index.vue'

export default {
  name: 'compositionBar',
  components: {barVideo},
  props: ['isActive', 'player', 'composition', 'contentKalpa', 'actionsPosition'],
  data () {
    return {
      barComponent: {
        VIDEO: 'bar-video',
        IMAGE: 'bar-image',
        BOOK: 'bar-book',
        WEB: 'bar-web',
      }
    }
  },
}
</script>
