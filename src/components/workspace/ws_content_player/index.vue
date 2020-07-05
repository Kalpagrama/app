<template lang="pug">
component(
  v-if="content"
  :is="component[content.type]"
  :sid="sid"
  :content="content"
  :options="options"
  :active="active"
  :mini="mini"
  @ready="$emit('ready')"
  @seeked="$emit('seeked')")
  template(v-slot:controls)
    slot(name="controls")
  template(v-slot:controlsTools)
    slot(name="controlsTools")
</template>

<script>
import videoPlayer from './video_player'
import imagePlayer from './image_player'

export default {
  name: 'wsContentPlayer',
  components: {videoPlayer, imagePlayer},
  props: {
    sid: {
      type: String,
      default () {
        return 'wcp'
      }
    },
    content: {type: Object},
    options: {type: Object},
    active: {type: Boolean},
    mini: {type: Boolean},
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
