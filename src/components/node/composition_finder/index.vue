<template lang="pug">
.row.fit.bg-grey-9
  ws-menu(
    ctx="finder"
    :header="false" :toggle="false" :oid="oid"
    :pages="['contents', 'compositions']"
    @item="itemClick" @page="pageClick" :page="page")
</template>

<script>
// TODO search for all the contents and its layers, or composition + name...
// or create a composition
export default {
  name: 'compositionFinder',
  components: {},
  data () {
    return {
      oid: undefined,
      page: 'contents',
      node: null,
      dialogOpened: false
    }
  },
  methods: {
    itemClick ({type, item}) {
      this.$log('itemClick', type, item)
      if (type === 'content') {
        let content = item.compositions[0].layers[0].content
        this.$log('content', content)
        let composition = {
          operation: { type: 'CONCAT', items: [], operations: null },
          layers: [{ content: content, figuresAbsolute: [], figuresRelative: [], spheres: [] }]
        }
        this.$log('composition', composition)
        this.$emit('composition', composition)
      }
      else if (type === 'composition') {
        // TODO
      }
    },
    pageClick (p) {
      this.$log('pageClick', p)
      this.page = p
    },
    layerExport (l) {
      this.$log('layerExport')
      this.$emit('layer', l)
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
