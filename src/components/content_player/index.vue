<template lang="pug">
component(
  v-if="contentKalpa"
  :is="playerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  :source="contentKalpa.contentSource"
  :url="contentKalpa.url"
  :options="options"
  @player="$emit('player', $event)")
  template(v-slot:actions)
    slot(name="actions")
</template>

<script>
export default {
  name: 'wsContentPlayer',
  components: {
    playerVideo: () => import('./player_video/index.vue'),
    playerImage: () => import('./player_image/index.vue'),
    playerBook: () => import('./player_book/index.vue'),
  },
  props: {
    contentKalpa: {type: Object, required: true},
    options: {type: Object},
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
