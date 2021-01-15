<template lang="pug">
component(
  v-if="contentKalpa"
  v-bind="$props"
  :is="playerComponent[contentKalpa.type]"
  @player="$emit('player', $event)")
</template>

<script>
export default {
  name: 'contentPlayerIndex',
  components: {
    playerVideo: () => import('./player_video/index.vue'),
    playerImage: () => import('./player_image/index.vue'),
    playerBook: () => import('./player_book/index.vue'),
  },
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    isMini: {type: Boolean},
    contentKalpa: {type: Object, required: true},
    options: {type: Object},
    figures: {type: Array},
    styles: {type: Object},
  },
  data () {
    return {
      playerComponent: {
        VIDEO: 'player-video',
        IMAGE: 'player-image',
        BOOK: 'player-book'
      }
    }
  }
}
</script>
