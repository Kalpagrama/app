<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.fit.items-start.bg-grey-9
  //- dialogs
  //- ws item finder dialog
  q-dialog(v-model="itemFinderOpened" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="itemFinderOpened = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-60-8-8+'px'
        }`).row.full-width.bg-grey-9
        ws-item-finder(
          v-if="!node.items[0]"
          :types="['contentNotes', 'node']"
          @item="itemFound"
          @cancel="itemFinderOpened = false")
  //- composition editor dialog
  q-dialog(v-model="itemEditorOpened" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="itemEditorOpened = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative', zIndex: 200, transform: 'translate3d(0,0,0)',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-68+'px'
        }`
        ).row.full-width
        composition-editor(
          v-if="node.items[itemIndex]"
          :composition="node.items[itemIndex]" :content="node.items[itemIndex].content"
          @cancel="itemEditorOpened = false"
          ).bg-grey-8
  //- chain editor dialog
  //- node editor dialog
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(i,ii) in node.items" :key="ii"
        :style=`{
          position: 'relative',
          height: '400px'
        }`
        ).col-12
        //- actions
        //- edit
        q-btn(
          flat round color="white" icon="edit" @click="itemEdit(ii)"
          :style=`{
            position: 'absolute', zIndex: 1000, left: '8px', top: 'calc(50% - 20px)',
            background: 'rgba(0,0,0,0.5)'}`)
        //- delete
        q-btn(
          flat round color="red" icon="delete" @click="itemDelete(ii)"
          :style=`{
            position: 'absolute', zIndex: 1000, left: '8px', top: '20%',
            background: 'rgba(0,0,0,0.5)'}`)
        //- composition
        composition(
          ctx="workspace"
          :value="i"
          :visible="true"
          :active="!itemEditorOpened"
          :mini="false")
      //- essence and add
      div(
        :style=`{
          height: '60px'
        }`
        ).row.full-width.q-pa-sm
        .col.q-pr-sm
          q-input(
            v-model="node.name"
            filled color="green" dark
            placeholder="Whats the essence?"
            :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
            ).full-width.bg-grey-9
        q-btn(round flat color="green" icon="add" @click="itemFind(node.items.length)"
          :style=`{width: '50px', background: '#555'}`)
  //- footer
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
    .col
    q-btn(push color="green" no-caps @click="nodePublish()").q-px-sm Publish
</template>

<script>
import assert from 'assert'

export default {
  name: 'nodeEditor',
  props: ['value', 'wsItemFinderOnBoot'],
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemIndex: 0,
      node: null,
      nodeNew: {
        name: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP'
      }
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('value CHANGED', to)
        if (to) {
          this.node = JSON.parse(JSON.stringify(to))
        }
        else {
          this.node = JSON.parse(JSON.stringify(this.nodeNew))
        }
        if (this.node.items.length === 0) {
          if (this.wsItemFinderOnBoot) {
            this.itemFind(0)
          }
        }
      }
    },
    node: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  },
  methods: {
    itemFind (index) {
      this.$log('itemFind', index)
      assert(index >= 0, 'itemFind: No index!')
      this.itemIndex = index
      this.itemFinderOpened = true
    },
    async itemFound ({type, item}) {
      this.$log('itemFound', type, item)
      switch (type) {
        case 'contentNotes': {
          let compositionInput = JSON.parse(JSON.stringify(item.rawData))
          // add layers workspace, non reactive...
          compositionInput.layersWorkspace = compositionInput.layers
          compositionInput.layers = []
          this.$set(this.node.items, this.itemIndex, compositionInput)
          this.itemEdit(this.itemIndex)
          await this.$wait(300)
          this.itemFinderOpened = false
          break
        }
        case 'node': {
          break
        }
        case 'chain': {
          break
        }
        default: {
          this.$log('No such type!')
        }
      }
    },
    itemEdit (index) {
      this.$log('itemEdit', index)
      assert(index >= 0, 'itemEdit: No index!')
      this.itemEditorOpened = true
    },
    itemEdited () {
      this.$log('itemEdited')
      this.itemEditorOpened = false
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      assert(index >= 0, 'itemDelete: No index!')
      if (!confirm('Delete item ?!')) return
      this.$delete(this.node.items, index)
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('nodePublish res', res)
        this.$log('nodePublish done')
      }
      catch (e) {
        this.$log('nodePublish error', e)
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
