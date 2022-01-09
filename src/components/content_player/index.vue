<template lang="pug">
component(
  v-if="contentKalpa"
  v-bind="$props"
  :is="playerComponent[contentKalpa.type]"
  @player="$emit('player', $event)")
  template(v-for="(index, name) in $slots" v-slot:[name])
    slot(:name="name")
  template(v-for="(index, name) in $slots" v-slot:[name]="data")
    slot(:name="name" v-bind="data")
</template>

<script>
import playerVideo from './player_video/index.vue'
import playerImage from './player_image/index.vue'
import playerBook from './player_book/index.vue'
export default {
  name: 'contentPlayer',
  components: {
    playerImage,
    playerVideo,
    playerBook
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
