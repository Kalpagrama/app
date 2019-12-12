<template lang="pug">
.row.full-width
  node(:nodeFullReady="node")
  .row.full-width
    .row.full-width spheres
    .row.full-width categories
    .row.full-width options
    .row.full-width actions...
</template>

<script>
export default {
  name: 'ncSave',
  props: ['node'],
  data () {
    return {
      nodePublishing: false,
      nodePublishingError: null,
      nodeSaving: false,
      nodeSavingError: null
    }
  },
  methods: {
    async nodeSave () {
      try {
        this.$log('nodeSave start', this.node)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.nodeSaving = false
        this.nodeSavingError = null
        this.$log('nodeSave done')
        this.$emit('saved', res)
      } catch (e) {
        this.$log('nodeSave error', e)
        this.nodeSaving = false
        this.nodeSavingError = e
      }
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('res', res)
        this.nodePublishing = false
        this.nodePublishingError = null
        this.$log('nodePublish done')
        this.$emit('published')
      } catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
        this.nodePublishingError = e
      }
    },
  },
  mounted () {
    this.$log('mounted', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
