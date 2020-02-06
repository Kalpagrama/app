<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- TODO: global theme styles: body :style=`{color: 'green !important'}`
  q-page-container(
  ).row.full-width.window-height.bg-black
    ws-items(@page="page = $event" @node="nodeClick" :oid="node ? node.oid : false")
    .col.full-height
      composition-editor(
        v-if="page === 'contents' && node && nodeIsContent(node)"
        :node="node" :compositionIndex="0")
      node-editor(
        v-if="page === 'nodes'"
        :value="node ? node : null")
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
    page: {
      handler (to, from) {
        this.$log('page CHANGED', to)
        if (to !== from) this.node = null
      }
    }
  },
  methods: {
    async nodeClick (node) {
      this.$log('nodeClick', node)
      this.node = null
      this.$nextTick(() => {
        this.node = node
      })
    },
    nodeIsContent (node) {
      if (node.name.split('-')[0] === 'CONTENT') return true
      else return false
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
