<template lang="pug">
node-layout-pip(
  v-bind="$props" :nodeFull="nodeFull"
  @meta="$emit('meta', $event)")
</template>

<script>
// :is="`node-layout-${layout || node.layout}`"
import nodeLayoutPip from './layout_pip'

export default {
  name: 'nodeIndex',
  props: ['ctx', 'index', 'node', 'needFull', 'nodeFullReady', 'visible', 'active', 'mini', 'layout', 'opened', 'essence'],
  components: {nodeLayoutPip},
  data () {
    return {
      nodeFull: null
    }
  },
  watch: {
    node: {
      handler (to, from) {
        // this.$log('node CHANGED', to)
        this.nodeLoad()
      }
    },
    needFull: {
      immediate: true,
        async handler (to, from) {
          if (this.nodeFullReady) return
          if (to) await this.nodeLoad()
          else await this.nodeDestroy()
        }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          // this.$log('nodeFullReady CHANGED', to)
          this.nodeFull = this.nodeFullReady
        }
      }
    }
  },
  methods: {
    async nodeLoad () {
      // this.$log('nodeLoad start', this.node.oid)
      let nodeFull = null
      try {
        nodeFull = await this.$store.dispatch('objects/get', { oid: this.node.oid, priority: 0 })
      } catch (err) {
        this.$emit('meta', ['error', 'nodeLoad'])
      }
      this.nodeFull = nodeFull
    },
    async nodeDestroy () {
      if (!this.nodeFull) return
      // this.$log('nodeDestroy', this.node.oid)
      this.nodeFull = null
    }
  }
}
</script>
