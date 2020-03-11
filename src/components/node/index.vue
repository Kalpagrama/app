<template lang="pug">
component(
  :is="`node-layout-${layout || node.layout}`"
  :ctx="ctx" :index="index"
  :node="node" :nodeFull="nodeFull" :visible="visible" :active="active" :nodeLoad="nodeLoad"
  @open="$emit('open', [node, nodeFull])")
</template>

<script>
import nodeLayoutPip from './layout_pip'
import nodeLayoutRubick from './layout_rubick'
import nodeLayoutByte from './layout_byte'

export default {
  name: 'nodeIndex',
  props: ['ctx', 'index', 'node', 'needFull', 'needFullPreload', 'nodeFullReady', 'visible', 'active', 'layout'],
  components: {nodeLayoutPip, nodeLayoutRubick, nodeLayoutByte},
  data () {
    return {
      nodeFull: null
    }
  },
  computed: {
  },
  watch: {
    // node: {
    //   handler (to, from) {
    //     if (to && this.nodeFull) {
    //       if (to.oid !== this.nodeFull.oid) {
    //         this.nodeLoad()
    //       }
    //     }
    //   }
    // },
    needFull: {
      immediate: true,
        async handler (to, from) {
          if (to) await this.nodeLoad()
          else await this.nodeDestroy()
        }
    },
    needFullPreload: {
      immediate: true,
      async handler (to, from) {
        if (to) await this.nodePreLoad()
        else await this.nodeDestroy()
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('nodeFullReady CHANGED', to)
          this.nodeFull = this.nodeFullReady
        }
      }
    }
  },
  methods: {
    async nodePreLoad () {
      if (this.nodeFull) return
      let oid = this.node.oid
      // this.$log(`nodePreLoad start indx=${this.index} oid=${oid}`)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 1 })
      } catch (err) {
        // приоритет 1 - не гарантирует что ядро будет загружено. Запрос может быть отвергнут.
        if (err !== 'queued object was evicted legally'){
          // this.$logE('nodePreLoad error', err)
          this.$emit('hide') // не показывать это ядро
          node = null
        }
      }
      // if (node) this.$log('nodePreLoad OK! indx=', this.index, oid)
    },
    async nodeLoad () {
      // if (this.nodeFull) return
      let oid = this.node.oid
      this.$log(` nodeLoad start indx=${this.index}  oid=${oid}`)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        // this.$logE('nodeLoad error', err)
        this.$emit('hide') // не показывать это ядро
        node = null
        this.nodeFullError = err
      }
      if (node) {
        // this.$log(`np-test: nodeLoad OK ! indx=${this.index}  oid=${oid}`, node)
        this.nodeFull = node
        this.$nextTick(async () => {
          // if (this.visible) await this.play()
        })
      }
    },
    async nodeDestroy () {
      // this.$log('nodeDestroy')  && !this.needFull && !this.needFullPreload
      if (this.nodeFull) {
        this.$log(`node CLEAR indx=${this.index} oid=${this.node.oid}`)
        this.nodeFull = null
      }
    }
  }
}
</script>
