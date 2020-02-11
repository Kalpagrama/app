<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- TODO: global theme styles: body :style=`{color: 'green !important'}`
  q-page-container(
  ).row.full-width.window-height.bg-black
    ws-items(
      :ctx="$q.screen.gt.xs ? 'workspace' : 'finder'"
      :oid="node ? node.oid : false" :page="page"
      @page="$router.push({params: {page: $event}})" @item="itemClick").bg-grey-9
    .col.full-height.bg-grey-10
      //- note-editor
      composition-editor(
        v-if="page === 'contents' && node && nodeIsContent(node)"
        ctx="composition"
        :node="node" :compositionIndex="0").bg-black
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
// import compositionEditor from 'components/node/composition_editor'
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
