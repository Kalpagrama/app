<template lang="pug">
div(
  v-if="node"
  :style=`{position: 'relative'}`
  ).row.full-width.b-30
  component(
    :is="`edit-${pageId}`"
    :node="node")
    template(v-slot:header=`{}`)
      ne-header(:node="node" :pages="pages" :pageId="pageId" @pageId="pageId = $event" @cancel="$emit('cancel')")
</template>

<script>
import assert from 'assert'
import neHeader from './ne_header'
import editInfo from './edit_info'
import editItems from './edit_items'
import editSpheres from './edit_spheres'
import editPreview from './edit_preview'

export default {
  name: 'nodeEditor',
  components: {neHeader, editInfo, editItems, editSpheres, editPreview},
  props: ['mode', 'essence', 'node', 'wsItemFinderOnBoot', 'paddingTop'],
  data () {
    return {
      scrollTop: 0,
      scrollHeight: 0,
      nodePublishing: false,
      pageId: 'items',
      pages: [
        {id: 'info', name: 'Info'},
        {id: 'items', name: 'Items'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'preview', name: 'Preview'}
      ]
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      this.scrollHeight = e.target.scrollHeight
      this.scrollTop = e.target.scrollTop
    },
    scrollTo (val) {
      this.$log('scrollTo', val)
      this.$tween.to(this.$refs.nodeEditorScrollArea, 0.5, {scrollTop: val})
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
