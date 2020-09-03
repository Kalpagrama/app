<template lang="pug">
component(
  :is="playerComponent[composition.outputType]"
  :composition="composition"
  :isVisible="isVisible"
  :isActive="isActive"
  :options="options"
  @previewClick="$emit('previewClick')"
  @ended="$emit('ended')")
</template>

<script>
import playerVideo from './player_video/index.vue'

export default {
  name: 'compositionPlayer',
  components: {playerVideo},
  props: ['isActive', 'isVisible', 'composition', 'options'],
  data () {
    return {
      playerComponent: {
        VIDEO: 'player-video',
        IMAGE: 'player-image',
        BOOK: 'player-book',
        WEB: 'player-web',
      }
    }
  },
}
</script>
