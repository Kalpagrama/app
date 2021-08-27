<template lang="pug">
.row
  component(
    v-if="itemFull"
    :is="itemComponent"
    :item="itemFull"
    :isActive="isActive"
    :showHeader="showHeader"
    :showSpheres="showSpheres"
    :showActions="showActions"
    )
</template>

<script>
import typeBook from 'src/components/kalpa_item/item_preview/type_book.vue'
import typeImage from 'src/components/kalpa_item/item_preview/type_image.vue'
import typeVideo from 'src/components/kalpa_item/item_preview/type_video.vue'
import typeNode from 'src/components/kalpa_item/item_preview/type_node.vue'
import typeContent from 'src/components/kalpa_item/item_preview/type_content.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemPreview',
  components: {
    typeBook,
    typeImage,
    typeVideo,
    typeNode,
    typeContent,
  },
  props: ['item', 'isActive', 'showHeader', 'showSpheres', 'showActions'],
  data () {
    return {
      itemFull: null
    }
  },
  computed: {
    itemComponent () {
      if (this.itemFull.type === 'NODE') return 'type-node'
      else if (['VIDEO', 'IMAGE', 'BOOK', 'GIF'].includes(this.itemFull.type)) return 'type-content'
      else if (this.itemFull.type === 'COMPOSITION' && this.itemFull.outputType === 'VIDEO') return 'type-video'
      else if (this.itemFull.type === 'COMPOSITION' && this.itemFull.outputType === 'IMAGE') return 'type-image'
      else if (this.itemFull.type === 'COMPOSITION' && this.itemFull.outputType === 'BOOK') return 'type-book'
      else return null
    },
  },
  async mounted () {
    this.$log('mounted')
    this.itemFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid)
    this.$log('itemFull=', this.itemFull)
  }
}
</script>
