<template lang="pug">
q-layout(view="hHh lpR fFf")
  q-header(
    v-if="$store.state.ui.debug"
    :style=`{paddingLeft: '66px'}`).bg-grey-8.q-pa-sm
    //- debug
    div(
      v-if="$store.state.ui.debug"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.bg-green.q-pa-sm.q-my-sm
      small.text-white.full-width node.oid: {{ node ? node.oid : false }}
  //- TODO: global theme styles: body :style=`{color: 'green !important'}`
  q-page-container.row.full-width.window-height.bg-black
    ws-items(
      :ctx="$q.screen.gt.xs ? 'workspace' : 'finder'"
      :oid="node ? node.oid : false" :page="page"
      @page="$router.push({params: {page: $event}})" @item="itemClick").bg-grey-9
    .col.full-height.bg-grey-10
      composition-editor(
        v-if="page === 'contents' && node && nodeIsContent(node)"
        ctx="composition"
        :node="node" :compositionIndex="0").bg-black
      node-editor(
        v-if="page === 'nodes'"
        :value="node ? node : null"
        @node="nodeChanged")
      ws-settings(
        v-if="page === 'settings'")
</template>

<script>
import wsItems from './ws_items'
import nodeEditor from 'components/node/node_editor'
import wsSettings from './ws_settings'

export default {
  name: 'workspaceIndex',
  components: {wsItems, nodeEditor, wsSettings},
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
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) this.page = to
        if (to !== from) this.node = null
        if (!to) this.$router.push({params: {page: 'nodes'}})
      }
    }
  },
  methods: {
    async itemClick ({type, item}) {
      this.$log('nodeClick', type, item)
      this.node = null
      this.$nextTick(() => {
        this.node = item
      })
    },
    nodeChanged (node) {
      this.$log('nodeChanged', node)
      this.$set(this, 'node', node)
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
