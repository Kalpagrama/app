<template lang="pug">
component(
  v-if="contentKalpa"
  v-bind="$props"
  :is="playerComponent[contentKalpa.type]"
  @player="$emit('player', $event)")
  template(v-for="(index, name) in $slots" v-slot:[name])
    slot(:name="name")
  template(v-for="(index, name) in $scopedSlots" v-slot:[name]="data")
    slot(:name="name" v-bind="data")
</template>

<script>
export default {
  name: 'contentPlayerIndex',
  components: {
    playerVideo: () => import('./player_video_new/index.vue'),
    playerImage: () => import('./player_image/index.vue'),
    playerBook: () => import('./player_book/index.vue'),
  },
  props: {
    contentKalpa: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
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
