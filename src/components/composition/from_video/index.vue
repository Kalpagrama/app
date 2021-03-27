<template lang="pug">
//- component(is="video-active" v-bind="$props")
component(is="video-always" v-bind="$props")
</template>

<script>
import videoActive from './video_active.vue'
import videoAlways from './video_always.vue'

export default {
  name: 'fromVideo',
  components: {
    videoActive,
    videoAlways,
  },
  props: ['composition', 'isActive', 'isVisible', 'objectFit'],
}
</script>
