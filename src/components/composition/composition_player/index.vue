<template lang="pug">
component(
  :is="playerComponent[composition.outputType]"
  :composition="composition"
  :isVisible="isVisible"
  :isActive="isActive"
  :options="options"
  @previewClick="$emit('previewClick')"
  @ended="$emit('ended')")
  template(v-for="(index, name) in $slots" v-slot:[name])
    slot(:name="name")
  template(v-for="(index, name) in $scopedSlots")
    slot(:name="name" v-bind="data")
</template>

<script>
import playerVideo from './player_video/index.vue'
import playerImage from './player_image/index.vue'

export default {
  name: 'compositionPlayer',
  components: {playerVideo, playerImage},
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
