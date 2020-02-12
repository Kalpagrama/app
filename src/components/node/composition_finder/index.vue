<template lang="pug">
.row.fit.bg-grey-9
  ws-menu(
    ctx="finder"
    :header="false" :toggle="false" :oid="oid"
    :pages="['contents', 'compositions']"
    @item="itemClick" @page="pageClick" :page="page"
    )
  q-dialog(v-model="dialogOpened" :maximized="true" position="bottom")
    div(@click.self="dialogOpened = false").row.full-width.window-height.items-center.content-center.justify-center.q-py-md
      composition-editor(
        ctx="composition"
        :node="node" :compositionIndex="0"
        @layerExport="layerExport"
        :style=`{maxWidth: '600px', borderRadius: '10px', overflow: 'hidden'}`).bg-black
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
      this.node = null
      this.$nextTick(() => {
        this.node = item
      })
      this.dialogOpened = true
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
