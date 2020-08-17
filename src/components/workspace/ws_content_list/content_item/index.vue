<template lang="pug">
component(
  v-if="content"
  :is="contentComponent[content.contentType]"
  :content="content"
  :contentKalpa="contentKalpa"
  :style=`{}`
  @remove="remove()"
  @pick="$emit('pick', content)"
  )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import typeVideo from './type_video.vue'
import typeImage from './type_image.vue'
import typeBook from './type_book.vue'
import typeWeb from './type_web.vue'

export default {
  name: 'wsContentList_contentItem',
  components: {typeVideo, typeImage, typeBook, typeWeb},
  props: ['content'],
  data () {
    return {
      contentKalpa: null,
      contentComponent: {
        VIDEO: 'typeVideo',
        IMAGE: 'typeImage',
        BOOK: 'typeBook',
        WEB: 'typeWeb'
      }
    }
  },
  watch: {
    // content: {
    //   immediate: true,
    //   async handler (to, from) {
    //   }
    // }
  },
  methods: {
    async remove () {
      this.$log('remove')
      await this.$rxdb.remove(this.content.id)
    }
  },
  async mounted () {
    // this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  }
}
</script>
