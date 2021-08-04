<template lang="pug">
component(
  :is="itemComponent"
  :item="item"
  :isActive="isActive")
</template>

<script>
import typeBook from 'src/components/kalpa_item/item_preview/type_book.vue'
import typeImage from 'src/components/kalpa_item/item_preview/type_image.vue'
import typeVideo from 'src/components/kalpa_item/item_preview/type_video.vue'
import typeNode from 'src/components/kalpa_item/item_preview/type_node.vue'
import typeContent from 'src/components/kalpa_item/item_preview/type_content.vue'

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
