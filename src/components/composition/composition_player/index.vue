<template lang="pug">
component(
  :is="playerComponent[composition.outputType]"
  v-bind="$props")
  slot
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
  props: [
    'composition',
    'isVisible',
    'isActive',
    'isMini',
    'options',
    'styles'
  ],
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
