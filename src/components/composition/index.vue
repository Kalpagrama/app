<template lang="pug">
component(
  :is="playerComponent[composition.outputType]"
  v-bind="$props")
  slot
</template>

<script>
import typeVideo from './type_video/index.vue'
import typeImage from './type_image/index.vue'
import typeBook from './type_book/index.vue'

export default {
  name: 'composition',
  components: {
    typeVideo,
    typeImage,
    typeBook
  },
  props: [
    'compositionKey',
    'composition',
    'isVisible',
    'isActive',
    'isMini',
    'options',
    'styles'
  ],
  data () {
    return {
      playerComponent: {
        VIDEO: 'type-video',
        IMAGE: 'type-image',
        BOOK: 'type-book',
        WEB: 'type-web',
      }
    }
  },
}
</script>
