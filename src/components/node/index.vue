<template lang="pug">
.row.full-width.bg-red.q-mb-md
  small.full-width width: {{ width }}
  small.full-width {{ node }}
  //- small.full-width {{ nodeFull }}
</template>

<script>
export default {
  name: 'nodeNew',
  props: ['index', 'width', 'node', 'nodeFullReady'],
  data () {
    return {
      nodeFullError: null,
      nodeFull: null
    }
  },
  watch: {
    needFull: {
      immediate: true,
      async handler (to, from) {
        this.$log('needFull CHANGED', to)
        if (to && !this.nodeFull) {
          this.nodeFull = await this.nodeLoad(this.node.oid)
        }
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        this.$log('nodeFullReady CHANGED', to)
        if (to) {
          this.nodeFull = this.nodeFullReady
        }
      }
    }
  },
  methods: {
    play () {
      this.$log('play')
    },
    pause () {
      this.$log('pause')
    },
    open () {
      this.$log('open')
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        this.$logE('node', 'nodeLoad error', err)
        node = null
        this.nodeFullError = err
      }
      this.$log('nodeLoad done', this.index, this.node.oid)
      return node
    }
  },
  mounted () {
    this.$log('mounted', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
