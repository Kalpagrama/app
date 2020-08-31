<template lang="pug">
component(
  :is="explorerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  :contentWorkspace="contentWorkspace"
  @out="$emit('out', $event)")
</template>

<script>
import explorerVideo from './explorer_video/index.vue'
import explorerImage from './explorer_image/index.vue'
// import explorerBook from './explorer_book/index.vue'
// import explorerWeb from './explorer_web/index.vue'

export default {
  name: 'wsContentExplorer',
  components: {explorerVideo, explorerImage},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      explorerComponent: {
        VIDEO: 'explorer-video',
        IMAGE: 'explorer-image',
        BOOK: 'explorer-book',
        WEB: 'explorer-web',
      }
    }
  }
}
</script>
