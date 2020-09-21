<template lang="pug">
component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  :query="query"
  @out="outHandle")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import explorerVideo from './explorer_video/index.vue'
import explorerImage from './explorer_image/index.vue'
// import explorerBook from './explorer_book/index.vue'
// import explorerWeb from './explorer_web/index.vue'

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
  methods: {
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
      else if (type === 'push') {
        this.$router.push(val)
      }
      else if (type === 'replace') {
        this.$router.replace(val)
      }
      else if (type === 'emit') {
        this.$emit('value', val)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
