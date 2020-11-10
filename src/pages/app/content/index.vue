<template lang="pug">
component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
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
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['pageWidth', this.$q.screen.width - 140])
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['pageWidth', this.$store.state.ui.pageWidthDefault])
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
