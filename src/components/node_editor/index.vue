<template lang="pug">
div(
  v-if="node"
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.fit.items-start.bg-grey-9
  //- dialogs
  //- ws item finder dialog
  q-dialog(v-model="itemFinderOpened" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: paddingTop+'px'}` @click.self="itemFinderOpened = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-8-8+'px'
        }`).row.full-width.bg-grey-9
        ws-item-finder(
          v-if="true"
          :types="['contentNotes', 'node']"
          @item="itemFound"
          @cancel="itemFinderOpened = false")
  //- composition editor dialog
  q-dialog(v-model="itemEditorOpened" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: 0+'px'}` @click.self="itemEditorOpened = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative', zIndex: 200, transform: 'translate3d(0,0,0)',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height+'px'
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
    .row.full-width.items-start.content-start.q-pt-sm.q-pl-sm
      div(
        v-for="(i,ii) in node.items" :key="ii"
        :style=`{
          position: 'relative',
          height: '400px'
        }`
        ).row.full-width.q-mb-sm
        //- actions
        //- //- edit
        //- q-btn(
        //-   flat round color="white" icon="edit" @click="itemEdit(ii)"
        //-   :style=`{
        //-     position: 'absolute', zIndex: 1000, left: '8px', top: 'calc(50% - 20px)',
        //-     background: 'rgba(0,0,0,0.5)'}`)
        //- //- delete
        //- q-btn(
        //-   flat round color="red" icon="delete" @click="itemDelete(ii)"
        //-   :style=`{
        //-     position: 'absolute', zIndex: 1000, left: '8px', top: '20%',
        //-     background: 'rgba(0,0,0,0.5)'}`)
        //- composition
        div(:style=`{position: 'relative'}`).col.full-height
          composition(
            ctx="workspace"
            :value="i"
            :visible="true"
            :active="!itemEditorOpened"
            :mini="false")
        //- composition actions: delete, edit, add
        div(:style=`{width: '60px'}`).row.full-height.justify-center.items-between.content-between.q-px-sm.q-pt-sm
          q-btn(round flat color="red" icon="delete_outline" @click="itemDelete(ii)")
          q-btn(round flat color="white" icon="edit" @click="itemEdit(ii)").bg-grey-8
          div(:style=`{height: '40px'}`).row.full-width
            q-btn(
              v-if="ii === node.items.length-1" @click="itemFind(node.items.length)"
              round flat color="white" icon="add"
              ).bg-grey-8
      div(v-if="node.items.length === 0").row.full-width.q-pa-sm
        q-btn(
          flat icon="add" color="green" @click="itemFind(node.items.length)"
          :style=`{height: '200px'}`).full-width.bg-grey-8
      //- //- essence and add
      //- div(
      //-   v-if="mode === 'edit'"
      //-   :style=`{
      //-     height: '60px'
      //-   }`
      //-   ).row.full-width.q-py-sm.q-pr-sm
      //-   .col
      //-     q-input(
      //-       v-model="node.name"
      //-       filled color="green" dark
      //-       placeholder="Whats the essence?"
      //-       :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
      //-       ).full-width.bg-grey-9
        //- q-btn(round flat color="green" icon="add" @click="itemFind(node.items.length)"
        //-   :style=`{width: '50px', background: '#555'}`)
  //- footer
  div(:style=`{order: -1}`).row.full-width.items-center.content-center.q-px-sm
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$emit('cancel')")
      .col
        //- span.text-white essence: {{essence}}
        span.text-white.text-bold Node editor
      q-btn(
        push color="green" no-caps @click="nodePublish()"
        :loading="nodePublishing").q-px-sm Publish
    div(
      :style=`{
      }`
      ).row.full-width.q-py-sm
      .col
        q-input(
          v-model="node.name"
          filled color="green" dark
          placeholder="Whats the essence?"
          label="Essence"
          :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
          ).full-width.bg-grey-9
</template>

<script>
import assert from 'assert'

export default {
  name: 'nodeEditor',
  props: ['mode', 'essence', 'node', 'wsItemFinderOnBoot', 'paddingTop'],
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemIndex: 0,
      nodePublishing: false
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
      this.itemIndex = index
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
        this.$emit('cancel')
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.nodePublishing = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.node && this.node.items.length === 0 && this.node.name.length === 0) {
      if (this.wsItemFinderOnBoot) {
        this.itemFind(0)
      }
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
