<template lang="pug">
div(
  v-if="node"
  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`
  ).column.fit.items-start.bg-grey-10
  //- header
  div(:style=`{order: -1}`).row.full-width.items-center.content-center.q-px-sm
    //- main navigation
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$emit('cancel')")
      .col.q-px-sm
        //- span.text-white essence: {{essence}}
        span.text-white.text-bold Node editor
      q-btn(
        push color="green" no-caps @click="nodePublish()"
        :loading="nodePublishing").q-px-sm Publish
    //- essence
    div(
      :style=`{
      }`
      ).row.full-width
      .col
        q-input(
          v-model="node.name"
          filled color="green" dark
          placeholder="Whats the essence?"
          label="Essence"
          :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
          ).full-width.bg-grey-8
    //- pages
    div(:style=`{}`).row.full-width.items-center
      kalpa-buttons(:value="pages" :id="pageId" idKey="id" @id="pageId = $event")
  //- body
  .col.full-width
    component(v-if="node" :is="`edit-${pageId}`" :node="node")
  //- footer
  //- TODO diff positions of header/footer
</template>

<script>
import assert from 'assert'
import editItems from './edit_items'
import editSpheres from './edit_spheres'
import editPreview from './edit_preview'

export default {
  name: 'nodeEditor',
  components: {editItems, editSpheres, editPreview},
  props: ['mode', 'essence', 'node', 'wsItemFinderOnBoot', 'paddingTop'],
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemIndex: 0,
      nodePublishing: false,
      pageId: 'items',
      pages: [
        {id: 'items', name: 'Items'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'preview', name: 'Preview'}
      ]
    }
  },
  watch: {
    node: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
        if (to) {
        }
        else {
          this.node = JSON.parse(JSON.stringify(this.nodeNew))
        }
      }
    }
  },
  methods: {
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
    },
    async nodeDelete () {
      this.$log('nodeDelete')
    }
  },
  mounted () {
    this.$log('mounted')
    // if (this.node && this.node.items.length === 0 && this.node.name.length === 0) {
    //   if (this.wsItemFinderOnBoot) {
    //     this.itemFind(0)
    //   }
    // }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
