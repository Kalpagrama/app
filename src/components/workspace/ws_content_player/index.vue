<template lang="pug">
component(
  v-if="content"
  v-bind="$props"
  :is="component[content.type]")
  template(v-slot:controls)
    slot(name="controls")
</template>

<script>
import videoPlayer from './video_player'
// import imagePlayer from './image_player'

export default {
  name: 'wsContentPlayer',
  components: {videoPlayer},
  props: {
    sid: {
      type: String,
      default () {
        return 'wcp'
      }
    },
    content: {type: Object}
  },
  data () {
    return {
      component: {
        VIDEO: 'video-player',
        IMAGE: 'image-player',
      }
    }
  },
}
</script>
