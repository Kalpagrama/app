<template lang="pug">
component(
  v-if="contentKalpa"
  :is="playerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa" :contentWorkspace="contentWorkspace"
  :source="contentKalpa.contentSource"
  :url="contentKalpa.url"
  :bars="bars"
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
    contentWorkspace: {type: Object},
    bars: {type: Array, default () { return [] }},
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
