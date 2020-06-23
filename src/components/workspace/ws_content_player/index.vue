<template lang="pug">
component(
  v-if="content"
  :is="component[content.type]"
  :sid="sid"
  :content="content"
  @ready="$emit('ready')")
  template(v-slot:controls)
    slot(name="controls")
  template(v-slot:controlsTools)
    slot(name="controlsTools")
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
