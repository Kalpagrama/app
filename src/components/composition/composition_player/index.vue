<template lang="pug">
component(
  :is="playerComponent[composition.outputType]"
  :oid="oid"
  :composition="composition"
  :isVisible="isVisible"
  :isActive="isActive"
  :styles="styles"
  :options="options")
</template>

<script>
import playerVideo from './player_video/index.vue'
import playerImage from './player_image/index.vue'
import playerBook from './player_book/index.vue'

export default {
  name: 'compositionPlayer',
  components: {
    playerVideo,
    playerImage,
    playerBook
  },
  props: ['oid', 'isActive', 'isVisible', 'composition', 'styles', 'options'],
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
