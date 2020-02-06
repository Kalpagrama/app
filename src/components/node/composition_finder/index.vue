<template lang="pug">
.row.fit.bg-grey-9
  ws-items(
    ctx="finder"
    :header="false" :toggle="false" :oid="oid"
    :pages="['contents', 'compositions']"
    @item="itemClick" @page="pageClick"
    )
  q-dialog(v-model="dialogOpened")
    //- h1(v-if="node").text-red node.name {{node.name}}
    //- h1 no node
    composition-editor(
      ctx="composition"
      :node="node" :compositionIndex="0"
      @layerExport="layerExport").bg-black
</template>

<script>
// search for all the contents and its layers, or composition + name...
// or create a composition
export default {
  name: 'compositionFinder',
  components: {},
  data () {
    return {
      oid: undefined,
      page: undefined,
      node: null,
      dialogOpened: false
    }
  },
  methods: {
    itemClick ({type, item}) {
      this.$log('itemClick', type, item)
      this.node = null
      this.$nextTick(() => {
        this.node = item
      })
      this.dialogOpened = true
    },
    pageClick (p, pi) {
      this.$log('pageClick')
      this.page = p.id
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
