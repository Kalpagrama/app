<template lang="pug">
component(
  v-if="contentKalpa"
  :is="playerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  :source="contentKalpa.contentSource"
  :url="contentKalpa.url"
  :thumbUrl="contentKalpa.thumbUrl"
  :isActive="isActive"
  :isVisible="isVisible"
  :options="options"
  @player="$emit('player', $event)")
  template(v-for="(index, name) in $slots" v-slot:[name])
    slot(:name="name")
  template(v-for="(index, name) in $scopedSlots" v-slot:[name]="data")
    slot(:name="name" v-bind="data")
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
    isActive: {type: Boolean, default: true},
    isVisible: {type: Boolean, default: true},
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
