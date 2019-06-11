<template lang="pug">
div(
  :style=`{
    height: $store.state.ui.width+10+'px',
    borderRadius: '20px', zIndex: 2, overflow: 'hidden', marginBottom: '-1px'}`
  ).column.full-width.shadow-3.bg-white
  //- top
  div(
    :style=`{
    zIndex: 100,
    borderBottomLeftRadius: '100%10px',
    borderBottomRightRadius: '100%10px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:index="0" :type="types[0]" :visible="node.visible" :preview="node.thumbUrl[0]" :fragment="nodeFull.fragments[0]")
      template(v-slot:editor)
        slot(name="editor" :index="0")
  //- name
  div(style=`height: 50px`).row.full-width.items-center.content-center.justify-center
    span(v-if="!$slots.name") {{ nodeFull.name }}
    //- span.bg {{ nodeFull.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
    zIndex: 100,
    borderTopLeftRadius: '100%10px',
    borderTopRightRadius: '100%10px',
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
  }
}
</script>
