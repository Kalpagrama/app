<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: nodeHeight+'px', minWidth: nodeWidth+'px', width: nodeWidth+'px',
    zIndex: 2, overflow: 'hidden',
    borderTopLeftRadius: '100%18px',
    borderTopRightRadius: '100%18px',
    borderBottomLeftRadius: '100%18px',
    borderBottomRightRadius: '100%18px'}`
  ).column.bg-white
  slot(name="rate")
  //- top
  div(
    :style=`{
    zIndex: 100,
    borderBottomLeftRadius: '100%18px',
    borderBottomRightRadius: '100%18px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :type="types[0]" :visible="node.visible" :preview="node.thumbUrl[0]" :fragment="nodeFull.fragments[0]")
      template(v-slot:editor)
        slot(name="editor" :index="0")
  //- name @click="!$slots.name ? $router.push({name: 'node', path: '/app/node', query: {node: node.oid}}) : ''"
  div(style=`height: 50px`
    ).row.full-width.items-center.content-center.justify-center
    span(v-if="!$slots.name") {{ nodeFull.name }}
    //- span.bg {{ nodeFull.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
    zIndex: 100,
    borderTopLeftRadius: '100%18px',
    borderTopRightRadius: '100%18px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :type="types[1]" :visible="node.visible" :preview="node.thumbUrl[1]" :fragment="nodeFull.fragments[1]")
      template(v-slot:editor)
        slot(name="editor" :index="1")
</template>

<script>
import nodeFragment from './node_fragment'
export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    types: {
      type: Array
    },
    node: {
      type: Object,
      required: true
    },
    nodeFull: {
      type: Object,
      required: true
    }
  },
  computed: {
    nodeHeight () {
      // let v = (this.nodeWidth - 50) / 2
      return this.nodeWidth
    },
    nodeWidth () {
      let w = this.$q.screen.width
      if (w >= 540) {
        return 540 - 20
      } else {
        return w - 20
      }
    }
  }
}
</script>
