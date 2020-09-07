<template lang="pug">
component(
  :is="creatorComponent[type]"
  :options="options")
</template>

<script>
import creatorVideo from './creator_video/index.vue'

export default {
  name: 'contentCreator',
  components: {creatorVideo},
  props: ['type', 'options'],
  data () {
    return {
      creatorComponent: {
        VIDEO: 'creator-video',
        IMAGE: 'creator-image',
        BOOK: 'creator-book',
        WEB: 'creator-web',
      }
    }
  },
}
</script>
