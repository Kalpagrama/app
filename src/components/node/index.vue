<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: nodeHeight+'px', minWidth: nodeWidth+'px', width: nodeWidth+'px',
    zIndex: 2, overflow: 'hidden',
    borderTopLeftRadius: '100%'+getRadius+'px',
    borderTopRightRadius: '100%'+getRadius+'px',
    borderBottomLeftRadius: '100%'+getRadius+'px',
    borderBottomRightRadius: '100%'+getRadius+'px'}`
  v-observe-visibility=`{
    callback: (isVisible) => $emit('visible', isVisible),
    throttle: 250,
    intersection: {
      threshold: 0.95
    }}`
  ).column.bg-white
  slot(name="rate")
  //- top
  div(
    :style=`{
    zIndex: 100,
    borderBottomLeftRadius: '100%'+getRadius+'px',
    borderBottomRightRadius: '100%'+getRadius+'px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :preview="node.thumbUrl[0]" :fragment="nodeFull.fragments[0]" :mini="mini")
      template(v-slot:empty)
        slot(name="empty" :index="0")
      template(v-slot:actions)
        slot(name="actions" :index="0")
  //- name @click="!$slots.name ? $router.push({name: 'node', path: '/app/node', query: {node: node.oid}}) : ''"
  div(style=`height: 50px`
    ).row.full-width.items-center.content-center.justify-center
    span(v-if="!$slots.name") {{ node.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
    zIndex: 100,
    borderTopLeftRadius: '100%'+getRadius+'px',
    borderTopRightRadius: '100%'+getRadius+'px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :preview="node.thumbUrl[1]" :fragment="nodeFull.fragments[1]" :mini="mini")
      template(v-slot:empty)
        slot(name="empty" :index="1")
      template(v-slot:actions)
        slot(name="actions" :index="1")
</template>

<script>
import nodeFragment from './node_fragment'
export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    node: { type: Object, required: true },
    nodeFull: { type: Object, required: true },
    visible: {type: Boolean},
    mini: {type: Boolean}
  },
  computed: {
    nodeHeight () {
      return this.nodeWidth
    },
    nodeWidth () {
      let w = this.$q.screen.width
      if (w >= 540) {
        return 540
      } else {
        return w
      }
    },
    getRadius () {
      return 10
    }
  }
}
</script>
