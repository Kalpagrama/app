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
  v-observe-visibility=`{
    callback: (isVisible, entry) => visibilityChanged(isVisible, entry),
    throttle: 250,
    intersection: {
      threshold: 1
    }}`
  ).column.bg-white
  slot(name="rate")
  //- top
  div(
    :style=`{
    zIndex: 100,
    borderBottomLeftRadius: '100%18px',
    borderBottomRightRadius: '100%18px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :preview="node.thumbUrl[0]" :fragment="nodeFull.fragments[0]" :mini="mini")
      template(v-slot:empty)
        slot(name="empty" :index="0")
      template(v-slot:actions)
        slot(name="actions" :index="0")
  //- name @click="!$slots.name ? $router.push({name: 'node', path: '/app/node', query: {node: node.oid}}) : ''"
  div(style=`height: 50px`
    ).row.full-width.items-center.content-center.justify-center
    span(v-if="!$slots.name") {{ nodeFull.name }}
    //- span {{node.oid}}/{{$store.state.feed.oid}}
    //- span.bg {{ nodeFull.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
    zIndex: 100,
    borderTopLeftRadius: '100%18px',
    borderTopRightRadius: '100%18px',
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
  methods: {
    visibilityChanged (isVisible, entry) {
      // this.$log('visibilityChanged')
      if (isVisible) {
        this.$log('visibilityChanged')
        this.$emit('visible', true)
      } else {
        this.$emit('visible', false)
      }
    }
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
    }
  }
}
</script>
