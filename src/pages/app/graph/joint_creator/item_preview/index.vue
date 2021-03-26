<template lang="pug">
component(
  :is="itemComponent"
  :item="item"
  :isActive="isActive")
</template>

<script>
import typeBook from './type_book.vue'
import typeImage from './type_image.vue'
import typeVideo from './type_video.vue'
import typeNode from './type_node.vue'
import typeContent from './type_content.vue'

export default {
  name: 'itemPreview',
  components: {
    typeBook,
    typeImage,
    typeVideo,
    typeNode,
    typeContent,
  },
  props: ['item', 'isActive'],
  computed: {
    itemComponent () {
      if (this.item.type === 'NODE') return 'type-node'
      else if (['VIDEO', 'IMAGE', 'BOOK', 'GIF'].includes(this.item.type)) return 'type-content'
      else if (this.item.__typename === 'Composition' && this.item.outputType === 'VIDEO') return 'type-video'
      else if (this.item.__typename === 'Composition' && this.item.outputType === 'IMAGE') return 'type-image'
      else if (this.item.__typename === 'Composition' && this.item.outputType === 'BOOK') return 'type-book'
      else return null
    }
  }
}
</script>
