<template lang="pug">
component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
  :key="contentKalpa.oid"
  :contentKalpa="contentKalpa"
  :query="query")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import explorerImage from './explorer_image/index.vue'
import explorerVideo from './explorer_video/index.vue'

export default {
  name: 'contentExplorer',
  components: {explorerVideo, explorerImage},
  props: ['oid', 'query'],
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
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          // this.contentKalpa = null
          // await this.$wait(250)
          this.$set(this, 'contentKalpa', await this.$rxdb.get(RxCollectionEnum.OBJ, to))
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
