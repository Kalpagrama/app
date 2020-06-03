<template lang="pug">
node-layout-pip(
  v-bind="$props" :nodeFull="nodeFull" :stateNode="stateNode")
</template>

<script>
// :is="`node-layout-${layout || node.layout}`"
import nodeLayoutPip from './layout_pip'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeIndex',
  props: ['ctx', 'index', 'node', 'needFull', 'nodeFullReady', 'visible', 'active', 'mini', 'layout', 'opened', 'essence'],
  components: {nodeLayoutPip},
  data () {
    return {
      nodeFull: null
    }
  },
  computed: {
    stateNode () {
      return {
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  watch: {
    node: {
      immediate: true,
      handler (to, from) {
        // this.$log('node CHANGED', to)
        if (this.nodeFullReady) return
        this.nodeLoad()
      }
    },
    needFull: {
      immediate: true,
        async handler (to, from) {
          // this.$log('nodeFull CHANGED to', to)
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
        nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.node.oid)
      } catch (err) {
        this.$emit('error')
      }
      this.nodeFull = nodeFull
    },
    async nodeDestroy () {
      // this.$log('nodeDestroy', this.node.oid)
      // if (!this.nodeFull) return
      // this.nodeFull = null
    }
  }
}
</script>
