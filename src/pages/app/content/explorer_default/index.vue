<template lang="pug">
component(
  v-if="contentKalpa"
  :is="'layout-'+layoutId"
  :contentKalpa="contentKalpa" :query="query")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import layoutDefault from './layout_default/index.vue'
import layoutFixed from './layout_fixed/index.vue'
import layoutNode from './layout_node/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    layoutDefault,
    layoutFixed,
    layoutNode,
  },
  data () {
    return {
      layoutId: 'default', // default, fixed, node
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
