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
    node-fragment(:state="state" :type="types.one" :fragment="node.fragments[0]" :visible="visible")
      template(v-slot:none)
        slot(name="fragment_none" :id="'one'")
      template(v-slot:actions)
        slot(name="fragment_actions")
  //- name
  div(style=`height: 50px`).row.full-width.items-center.justify-center
    //- span(v-if="!!$slots.name") {{ node.name }}
    span {{ node.name }}
    //- slot(name="name")
  //- bottom
  div(
    :style=`{
    borderTopLeftRadius: '100%10px',
    borderTopRightRadius: '100%10px',
    overflow: 'hidden'}`).col.bg-grey-4
    node-fragment(:state="state" :type="types.two" :fragment="node.fragments[1]" :visible="visible")
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
    state: {
      type: String,
      default: 'preview'
    },
    types: {
      type: Object
    },
    node: {
      default: () => {
        return {
          name: 'Сила в правде',
          fragments: [],
          spheres: []
        }
      }
    },
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>
