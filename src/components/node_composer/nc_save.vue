<template lang="pug">
.column.fit.bg-grey-3
  q-resize-observer(@resize="onResize")
  .col.full-width.scroll.br
    .row.full-width.q-pa-sm
      node(:width="width" :node="node" :nodeFullReady="node").bg-white
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px'}`).row.full-width.bg-white
        div(:style=`{height: '60px'}`).row.full-width actions
        div(:style=`{height: '60px'}`).row.full-width spheres
        div(:style=`{height: '60px'}`).row.full-width categories
  .row.full-width.justify-between.q-py-md.q-pr-sm
    q-btn(no-caps flat color="green" @click="$emit('close')")
      span {{$t('Cancel')}}
    //- q-btn(push no-caps :loading="nodeSaving" color="green" @click="nodeSave")
    //-   span.text-white {{$t('Save')}}
    q-btn(push no-caps :loading="nodePublishing" color="green" @click="nodePublish()"
      :style=`{borderRadius: '10px'}`)
      span.text-white {{$t('Publish')}}
</template>

<script>
export default {
  name: 'ncSave',
  props: ['node'],
  data () {
    return {
      width: 0,
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
    onResize (e) {
      this.width = e.width
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
