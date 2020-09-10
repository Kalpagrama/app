<template lang="pug">
component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  @out="outHandle")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import explorerVideo from './explorer_video/index.vue'
import explorerImage from './explorer_image/index.vue'
// import explorerBook from './explorer_book/index.vue'
// import explorerWeb from './explorer_web/index.vue'

export default {
  name: 'wsContentExplorer',
  components: {explorerVideo, explorerImage},
  data () {
    return {
      contentKalpa: null,
      explorerComponent: {
        VIDEO: 'explorer-video',
        IMAGE: 'explorer-image',
        BOOK: 'explorer-book',
        WEB: 'explorer-web',
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  methods: {
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    }
  }
}
</script>
