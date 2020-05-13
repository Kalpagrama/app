<template lang="pug">
component(
  :is="`${composerType}-composer`"
  :ctx="ctx"
  :composition="composition"
  :options="options"
  @close="$emit('close')")
</template>

<script>
import videoComposer from './video_composer'
// import imageComposer from './image_composer'
// import bookComposer from './book_composer'

export default {
  name: 'compositionEditor',
  components: { videoComposer },
  props: ['ctx', 'composition', 'options'],
  computed: {
    composerType () {
      // TODO depends on composition type?
      return 'video'
    }
  }
}
</script>
