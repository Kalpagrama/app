<template lang="pug">
component(
  v-if="contentKalpa && contentWorkspace"
  :is="contentComponent[contentKalpa.type]"
  :contentWorkspace="contentWorkspace"
  :contentKalpa="contentKalpa"
  @back="$router.back()")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import videoExplorer from 'components/ws_video_explorer/index.vue'
// import imageExplorer from 'components/ws_image_explorer/index.vue'
// import bookExplorer from 'components/ws_book_explorer/index.vue'

export default {
  name: 'pageApp_wsContent',
  components: {videoExplorer},
  data () {
    return {
      contentWorkspace: null,
      contentKalpa: null,
      contentComponent: {
        VIDEO: 'video-explorer',
        IMAGE: 'image-explorer',
        BOOK: 'book-explorer',
      }
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let {items: [item]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
              id: to
            }
          })
          this.contentWorkspace = item
          // this.$log('contentWorkspace', this.contentWorkspace)
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, item.contentOid)
          // this.$log('contentKalpa', this.contentKalpa)
        }
      }
    }
  },
}
</script>
