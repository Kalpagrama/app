<template lang="pug">
component(
  :is="barComponent[composition.outputType]"
  :composition="composition"
  :contentKalpa="contentKalpa"
  :player="player"
  )
</template>

<script>
import barVideo from './bar_video/index.vue'

export default {
  name: 'compositionBar',
  components: {barVideo},
  props: ['player', 'composition', 'contentKalpa'],
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
