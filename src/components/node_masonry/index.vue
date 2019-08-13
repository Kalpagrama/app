<template lang="pug">
.row.full-width
  q-resize-observer(@resize="onResize")
  q-scroll-observer(@scroll="onScroll")
  .row.full-width.items-start.content-start
    node(
      v-for="(n, ni) in nodes" :key="ni" :node="n" :maxHeight="0.5*$q.screen.height"
      ).bg-white.q-mb-md
</template>

<script>
import node from 'components/node'

export default {
  name: 'nodeMasonry',
  components: {node},
  props: {
    nodes: {
      type: Array
    }
  },
  data () {
    return {
      width: 0,
      height: 0
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e
    },
    onScroll (e) {
      this.$log('onScroll', e)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
