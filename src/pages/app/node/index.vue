<template lang="pug">
div(:style=`{height: height+'px'}`).row.full-width
  node-explorer
</template>

<script>
import nodeExplorer from 'components/node_explorer'

export default {
  name: 'pageApp__Node',
  components: { nodeExplorer },
  props: ['width', 'height'],
  data () {
    return {
      node: null,
      needFull: false,
      tab: 'node',
      active: false,
      nodeFull: null,
      nodesCurrent: [null, null],
      nodes: [[], []]
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus" scoped>
</style>
