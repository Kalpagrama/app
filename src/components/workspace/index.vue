<template lang="pug">
q-layout(view="hHh lpR fFf")
  //- TODO: global theme styles: body :style=`{color: 'green !important'}`
  q-page-container(
  ).row.full-width.window-height.bg-black
    ws-items(@node="nodeClick")
    .col.full-height
      composition-editor(
        v-if="node && nodeIsContent(node)"
        :node="node.object" :compositionIndex="0")
    div(
      v-if="false"
      :style=`{maxWidth: '500px', borderLeft: '1px solid #4caf50'}`
      ).row.fit.items-start.content-start
      node-editor
  //- footer
  q-footer.row.full-width.lt-sm
    slot(name="menuMobile")
</template>

<script>
import wsItems from './ws_items'
import compositionEditor from 'components/node/composition_editor'
import nodeEditor from 'components/node/node_editor'

export default {
  name: 'workspaceIndex',
  components: {wsItems, compositionEditor, nodeEditor},
  props: [],
  data () {
    return {
      node: null,
      wsItemsShow: true,
      wsItemsWidth: 400
    }
  },
  computed: {
  },
  watch: {
    wsItemsShow: {
      handler (to, from) {
        this.$log('wsItemsShow CHANGED', to)
        this.$tween.to(this, 0.5, {wsItemsWidth: to ? 400 : 0})
      }
    }
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
