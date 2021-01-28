<template lang="pug">
component(
  v-if="contentKalpa"
  :is="'layout-'+layoutId"
  :contentKalpa="contentKalpa" :query="query")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import layoutFixed from './layout_fixed/index.vue'
import layoutPopup from './layout_popup/index.vue'
import layoutNode from './layout_node/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    layoutFixed,
    layoutPopup,
    layoutNode,
  },
  data () {
    return {
      layoutId: 'popup', // node, popup, fixed
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    // document.body.style.background = 'rgb(0,0,0) !important'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
