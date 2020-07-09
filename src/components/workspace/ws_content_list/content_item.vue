<template lang="pug">
component(
  v-if="content && contentKalpa"
  :is="component[content.contentType]"
  :content="content"
  :contentKalpa="contentKalpa"
  @pick="$emit('pick')"
  @delete="$emit('delete')"
  @rename="$emit('rename')")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
// TODO: different content types and items...
import itemVideo from './item_video'
import itemImage from './item_image'

export default {
  name: 'contentItem',
  components: {itemVideo, itemImage},
  props: ['ctx', 'content'],
  data () {
    return {
      contentKalpa: null,
      mouseIsOver: false,
      thumbErrored: false,
      component: {
        VIDEO: 'item-video',
        IMAGE: 'item-image',
        BOOK: 'item-book',
        WEB: 'item-web',
      }
    }
  },
  computed: {
  },
  methods: {
    thumbErrorHandle () {
      // this.$log('thumbErrorHandle')
      this.thumbErrored = true
    },
  },
  async mounted () {
    // this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  }
}
</script>
