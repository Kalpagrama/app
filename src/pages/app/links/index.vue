<template lang="pug">
component(
  v-if="item"
  :is="`view-${viewId}`"
  :item="item"
  :key="item.oid")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import viewThreads from './view_threads/index.vue'
import viewBinary from './view_binary/index.vue'
import viewGallery from './view_gallery/index.vue'

export default {
  name: 'pageApp_links',
  components: {
    viewThreads,
    viewBinary,
    viewGallery,
  },
  data () {
    return {
      item: null,
      viewId: 'gallery', // gallery, threads, binary
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          this.item = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  methods: {
  },
  mounted () {
    // this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
