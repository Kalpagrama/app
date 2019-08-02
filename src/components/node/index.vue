<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: zIndex, overflow: 'hidden',
    borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px',
    borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px'}`
    v-observe-visibility=`{
      callback: (isVisible) => $emit('visible', isVisible),
      throttle: 250,
      intersection: {
        threshold: 0.8
    }}`
  ).row.full-width.bg-white
  //- rate
  slot(name="rate")
  //- top
  div(:style=`{zIndex: 100, borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px', overflow: 'hidden'}`
    ).row.full-width.bg-grey-4
    node-fragment(:index="0" :zIndex="zIndex" :node="node" :nodeFull="nodeFull" :mini="mini" :visible="visible")
      template(v-slot:empty)
        slot(name="empty" :index="0")
      template(v-slot:actions)
        slot(name="actions" :index="0")
      template(v-slot:node)
        slot(name="node" :index="0")
  //- name
  div(style=`height: 48px` @click="nodeNameClick").row.full-width.items-center.content-center.justify-center
    span(v-if="!$slots.name") {{ node.name }}
    slot(name="name")
  //- bottom
  div(:style=`{zIndex: 100, borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px', overflow: 'hidden'}`
    ).row.full-width.bg-grey-4
    node-fragment(:index="1" :zIndex="zIndex" :node="node" :nodeFull="nodeFull" :mini="mini" :visible="visible")
      template(v-slot:empty)
        slot(name="empty" :index="1")
      template(v-slot:actions)
        slot(name="actions" :index="1")
      template(v-slot:node)
        slot(name="node" :index="1")
</template>

<script>
import nodeFragment from './node_fragment'

export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    zIndex: {type: Number, default () { return 200 }},
    node: { type: Object, required: true },
    nodeFull: { type: Object },
    visible: {type: Boolean},
    mini: {type: Boolean},
    inEditor: {type: Boolean}
  },
  computed: {
    getRadius () {
      return 8
    }
  },
  methods: {
    nodeNameClick () {
      this.$log('nodeNameClick')
      if (this.inEditor) {
      } else {
        this.$router.push(`/app/node/${this.node.oid}`)
      }
    }
  }
}
</script>
