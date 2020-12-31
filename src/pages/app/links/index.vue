<template lang="pug">
component(
  v-if="item"
  :is="`view-${viewId}`"
  :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import viewThreads from './view_threads/index.vue'
import viewBinary from './view_binary/index.vue'

export default {
  name: 'pageApp_links',
  components: {
    viewThreads,
    viewBinary,
  },
  data () {
    return {
      item: null,
      viewId: 'binary', // threads, binary
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
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
    // document.body.style.background = 'black !important'
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
