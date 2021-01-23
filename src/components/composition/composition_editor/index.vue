<template lang="pug">
component(
  :is="editorComponent[composition.outputType]"
  :composition="composition"
  :contentKalpa="contentKalpa"
  :player="player")
</template>

<script>
import editorVideo from './editor_video/index.vue'

export default {
  name: 'compositionEditor',
  components: {editorVideo},
  props: ['player', 'composition', 'contentKalpa'],
  data () {
    return {
      editorComponent: {
        VIDEO: 'editor-video',
        IMAGE: 'editor-image',
        BOOK: 'editor-book',
        WEB: 'editor-web',
      }
    }
  },
}
</script>
