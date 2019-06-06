<template lang="pug">
div(
  :style=`{
    height: $store.state.ui.width+10+'px',
    borderRadius: '20px', zIndex: 2, overflow: 'hidden', marginBottom: '-1px'}`
  ).column.full-width.shadow-3.bg-white
  //- top
  div(
    :style=`{
    borderBottomLeftRadius: '100%10px',
    borderBottomRightRadius: '100%10px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:type="types.one" :visible="node.visible" :preview="node.thumbUrl[0]" :fragment="nodeFull.fragments[0]")
      template(v-slot:none)
        slot(name="fragment_none" :id="'one'")
      template(v-slot:actions)
        slot(name="fragment_actions")
  //- name
  div(style=`height: 50px`).row.full-width.items-center.justify-center
    span(v-if="!!$slots.name") {{ nodeFull.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
    borderTopLeftRadius: '100%10px',
    borderTopRightRadius: '100%10px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:type="types.two" :visible="node.visible" :preview="node.thumbUrl[1]" :fragment="nodeFull.fragments[1]")
      template(v-slot:none)
        slot(name="fragment_none" :id="'two'")
      template(v-slot:actions)
        slot(name="fragment_actions")
</template>

<script>
import nodeFragment from './node_fragment'
export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    types: {
      type: Object
    },
    node: {
      type: Object,
      required: true
    },
    nodeFull: {
      type: Object,
      required: true
    }
  }
}
</script>
