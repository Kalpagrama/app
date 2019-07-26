<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: zIndex || 200,
    width: nodeWidth+'px', overflow: 'hidden',
    borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px',
    borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px'}`
  v-observe-visibility=`{
    callback: (isVisible) => $emit('visible', isVisible),
    throttle: 250,
    intersection: {
      threshold: 0.8
    }}`
  ).row.bg-white
  //- rate
  //- slot(name="rate")
  //- top
  div(
    :style=`{
      zIndex: 100,
      borderBottomLeftRadius: '100%'+getRadius+'px',
      borderBottomRightRadius: '100%'+getRadius+'px',
      overflow: 'hidden'
    }`).row.full-width.bg-grey-4
    div(v-if="!nodeFull").row.full-width
      img(:src="node.thumbUrl[0]" width="100%")
    node-fragment(
      v-else
      :index="0"
      :zIndex="zIndex"
      :preview="node.thumbUrl[0]"
      :fragment="nodeFull.fragments[0]"
      :visible="visible"
      :mini="mini"
      :width="nodeWidth"
      :height="getFragmentHeight(0)")
  //- name
  div(style=`height: 48px`
    ).row.full-width.items-center.content-center.justify-center
    small(v-if="!$slots.name") {{ node.name }}
    slot(name="name")
  //- bottom
  div(
    :style=`{
      zIndex: 100,
      borderTopLeftRadius: '100%'+getRadius+'px',
      borderTopRightRadius: '100%'+getRadius+'px',
      overflow: 'hidden'
    }`).row.full-width.bg-grey-4
    div(v-if="!nodeFull").row.full-width
      img(:src="node.thumbUrl[1]" width="100%")
    node-fragment(
      v-else
      :index="0"
      :zIndex="zIndex"
      :preview="node.thumbUrl[1]"
      :fragment="nodeFull.fragments[1]"
      :visible="visible"
      :mini="mini"
      :width="nodeWidth"
      :height="getFragmentHeight(1)")
</template>

<script>
import nodeFragment from './node_fragment'
export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    zIndex: {type: Number},
    node: { type: Object, required: true },
    nodeFull: { type: Object },
    visible: {type: Boolean},
    mini: {type: Boolean}
  },
  computed: {
    nodeWidth () {
      let w = this.$q.screen.width
      let wm = this.$store.state.ui.nodeMaxWidth
      if (w >= wm) return wm
      else return w
    },
    getRadius () {
      return 8
    }
  },
  methods: {
    getFragmentHeight (index) {
      let w = this.nodeFull.fragments[index].content.width
      let h = this.nodeFull.fragments[index].content.height
      let k = h / w
      return this.nodeWidth * k
    }
  }
}
</script>
