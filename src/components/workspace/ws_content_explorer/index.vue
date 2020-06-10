<template lang="pug">
//- .row.fit.q-pt-sm
component(
  v-if="content"
  :is="component[content.contentType]"
  :content="content"
  )
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import videoExplorer from './video_explorer'
// import imageExplorer from './image_explorer'
// import webExplorer from './web_explorer'

export default {
  name: 'wsContentExplorer',
  components: {videoExplorer},
  data () {
    return {
      content: null,
      component: {
        VIDEO: 'video-explorer',
        IMAGE: 'image-explorer',
        BOOK: 'book-explorer',
        WEB: 'web-explorer',
      }
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO', to)
        if (to) {
          let {items: [content]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
              id: to
            }
          })
          this.$log('content', content)
          this.content = content
        }
      }
    }
  },
}
</script>
