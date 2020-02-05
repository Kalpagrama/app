<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- TODO: global theme styles: body :style=`{color: 'green !important'}`
  q-page-container(
  ).row.full-width.window-height.bg-black
    ws-items(@page="page = $event" @node="nodeClick" :oid="node ? node.object.oid : false")
    .col.full-height
      composition-editor(
        v-if="page === 'contents' && node && nodeIsContent(node)"
        :node="node.object" :compositionIndex="0")
      node-editor(
        v-if="page === 'nodes' && node"
        :node="node.object")
      ws-settings(
        v-if="page === 'settings'")
    //- div(
    //-   v-if="false"
    //-   :style=`{maxWidth: '500px', borderLeft: '1px solid #4caf50'}`
    //-   ).row.fit.items-start.content-start
    //-   node-editor
  //- footer
  q-footer.row.full-width.lt-sm
    slot(name="menuMobile")
</template>

<script>
import wsItems from './ws_items'
import compositionEditor from 'components/node/composition_editor'
import nodeEditor from 'components/node/node_editor'
import wsSettings from './ws_settings'

export default {
  name: 'workspaceIndex',
  components: {wsItems, compositionEditor, nodeEditor, wsSettings},
  props: [],
  data () {
    return {
      page: undefined,
      node: null
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    async nodeClick (node) {
      this.$log('nodeClick', node)
      this.node = null
      await this.$wait(300)
      this.node = node
    },
    nodeIsContent (node) {
      let arr = node.object.name.split('-')
      if (arr[0] === 'CONTENT') {
        let contentOid = arr[1]
        return true
      } else {
        return false
      }
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
