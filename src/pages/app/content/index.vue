<template lang="pug">
explorer-default(
  v-if="contentKalpa"
  :key="contentKalpa.oid"
  :contentKalpa="contentKalpa"
  :query="query")
//- component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
  :key="contentKalpa.oid"
  :contentKalpa="contentKalpa"
  :query="query")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import explorerDefault from './explorer_default/index.vue'
// import explorerBook from './explorer_book/index.vue'
// import explorerVideo from './explorer/index.vue'
// import explorerImage from './explorer/index.vue'

export default {
  name: 'contentExplorer',
  components: {
    explorerDefault,
    // explorerBook,
    // explorerVideo,
    // explorerImage
  },
  props: ['oid', 'query'],
  data () {
    return {
      contentKalpa: null,
      explorerComponent: {
        VIDEO: 'explorer-video',
        IMAGE: 'explorer-video',
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
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
