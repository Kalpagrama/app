<template lang="pug">
div(
  :style=`{
    height: $store.state.ui.width+10+'px',
    borderRadius: '20px', zIndex: 2, overflow: 'hidden', marginBottom: '-1px'}`
  ).column.full-width.shadow-1.bg-white
  //- top
  div(
    ref="kbot1"
    :style=`{
    borderBottomLeftRadius: '100%10px',
    borderBottomRightRadius: '100%10px',
    overflow: 'auto'}`).col.bg-grey-4
    node-fragment()
      template(v-slot:actions)
        slot(name="actions_top")
  //- title
  div(style=`height: 50px`).row.full-width.items-center.justify-center
    //- span {{ node.title }}
    q-input(v-model="title" borderless :input-class="['text-center']" placeholder="В чем суть?").fit
  //- bottom
  div(
    ref="kbot2"
    :style=`{
    borderTopLeftRadius: '100%10px',
    borderTopRightRadius: '100%10px',
    overflow: 'auto'}`).col.bg-grey-4
    node-fragment(bottom)
      template(v-slot:actions)
        slot(name="actions_bottom")
</template>

<script>
import nodeFragment from './node_fragment'
export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    type: {
      type: String,
      default: 'preview'
    },
    node: {
      default: () => {
        return {
          title: 'Сила в правде',
          fragments: [],
          spheres: []
        }
      }
    }
  },
  data () {
    return {
      title: ''
    }
  },
  mounted () {
  }
}
</script>
