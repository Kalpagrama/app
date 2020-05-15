<template lang="pug">
div(
  v-if="node"
  :style=`{position: 'relative'}`
  ).column.full-width.b-30
  //- header
  div(
    v-if="true"
    :style=`{
      position: 'relative',
      zIndex: 1000,
      borderRadius: $q.screen.width > 600 ? '10px' : '0 0 10px 10px'
    }`
    ).row.full-width.items-center.content-center.q-px-sm.b-100
    //- main navigation
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$emit('cancel')")
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(:style=`{fontSize: '20px'}`).text-white.text-bold Node editor
      q-btn(
        push color="green" no-caps @click="nodePublish()"
        :style=`{height: '42px'}`).q-px-sm Publish
    //- essence
    div(
      :style=`{
        zIndex: 100
      }`
      ).row.full-width
      .col
        q-input(
          v-model="node.name"
          filled color="white" dark
          label="Whats the essence?"
          :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
          ).full-width.b-150
    //- pages
    .row.full-width.items-center.content-center
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-100
        kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="pageId = $event")
  //- body
  .col.full-width
    component(
      :is="`edit-${pageId}`"
      :node="node")
</template>

<script>
import assert from 'assert'
import editInfo from './edit_info'
import editItems from './edit_items'
import editSpheres from './edit_spheres'
import editPreview from './edit_preview'

export default {
  name: 'nodeEditor',
  components: {editInfo, editItems, editSpheres, editPreview},
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
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        switch (this.mode) {
          case 'edit': {
            break
          }
          case 'extend': {
            nodeInput.name = this.essence
            break
          }
        }
        this.$log('nodeInput', nodeInput)
        let res = await this.$store.dispatch('node/nodeCreate', nodeInput)
        this.$log('nodePublish res', res)
        this.$log('nodePublish done')
        this.nodePublishing = false
        // this.$emit('cancel')
        this.$emit('publish', res.oid)
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
      }
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
