// brief карточка элемента (витрина)
<template lang="pug">
component(
  v-if="itemFull"
  :is="itemComponent"
  :item="itemFull"
  :isActive="isActive"
  )
</template>

<script>
import typeBook from 'src/components/kalpa_item/item_card/type_book.vue'
import typeImage from 'src/components/kalpa_item/item_card/type_image.vue'
import typeVideo from 'src/components/kalpa_item/item_card/type_video.vue'
import typeBlock from 'src/components/kalpa_item/item_card/type_block.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemCard',
  components: {
    typeBook,
    typeImage,
    typeVideo,
    typeBlock,
  },
  props: ['item', 'isActive'],
  data () {
    return {
      itemFull: null
    }
  },
  computed: {
    itemComponent () {
      switch (this.item.type){
        case 'BOOK': return 'type-book'
        case 'VIDEO': return 'type-video'
        case 'IMAGE': return 'type-image'
        case 'BLOCK': return 'type-block'
        default: throw new Error('bad item' + this.item.type)
      }
    },
  },
  async mounted () {
    this.$log('mounted', this.item)
    this.itemFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid)
    this.$log('itemFull=', this.itemFull)
  }
}
</script>
