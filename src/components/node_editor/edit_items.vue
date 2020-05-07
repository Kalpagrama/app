<template lang="pug">
.column.fit
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pt-sm.q-pl-sm
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
      //- items
      div(
        v-for="(i,ii) in node.items" :key="ii"
        :style=`{
          position: 'relative',
          height: '860px',
          borderRadius: '10px',
          overflow: 'hidden',
          maxHeight: itemIndex === ii ? '860px' : '460px',
        }`
        ).row.full-width.q-mb-sm
        //- composition container
        div(:style=`{position: 'relative', maxWidth: '100%'}`).col.full-height
          composition(
            ctx="workspace"
            :value="i"
            :visible="true"
            :active="itemIndex === ii"
            :mini="false"
            :styles=`{
              paddingBottom: itemIndex === ii ? '480px' : '0px'
            }`)
            template(v-slot:editor=`{content, player, meta}`)
              composer(
                v-if="itemIndex === ii"
                ctx="workspace"
                :composition="i"
                :player="player" :meta="meta"
                @meta="$parent.emit('meta', $event)"
                @cancel="$emit('cancel')"
                :styles=`{
                  paddingBottom: itemIndex === ii ? 460 : 0
                }`)
        //- composition actions: delete, edit, add
        div(:style=`{width: '60px'}`).row.full-height.justify-center.items-between.content-between.q-px-sm
          q-btn(round flat color="red-4" icon="delete_outline" @click="itemDelete(ii)"
            :style=`{background: 'rgba(0,0,0,0.1)'}`)
          q-btn(round flat color="white" icon="edit" @click="itemEdit(ii)").bg-grey-8
      //- add first item
      div(v-if="node.items.length === 0").row.full-width.q-pr-sm
        q-btn(
          flat icon="add" color="green" @click="itemFind(node.items.length)"
          :style=`{height: '200px'}`).full-width.bg-grey-8
      //- add second and beyond items
      div(v-if="node.items.length > 0").row.full-width
        .col.q-pb-sm
          q-btn(flat color="white" icon="add" @click="itemFind(node.items.length)"
            :style=`{height: '42px'}`).full-width.bg-grey-8
        div(:style=`{width: '60px'}`).row.q-pa-sm
</template>

<script>
import assert from 'assert'
import composer from 'components/node/composition_editor/video_composer/composer'

export default {
  name: 'nodeEditor-editItems',
  components: {composer},
  props: {
    node: {type: Object}
  },
  data () {
    return {
      itemIndex: null,
      itemFinderOpened: false,
      itemEditorOpened: false
    }
  },
  computed: {
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
        default: {
          this.$log('No such type!')
        }
      }
    },
    itemEdit (index) {
      this.$log('itemEdit', index)
      assert(index >= 0, 'itemEdit: No index!')
      if (this.itemIndex === index) {
        this.itemIndex = null
      }
      else {
        this.itemIndex = index
      }
      // this.itemIndex = index
      // this.itemEditorOpened = true
    },
    itemEdited () {
      this.$log('itemEdited')
      this.itemIndex = null
      this.itemEditorOpened = false
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      assert(index >= 0, 'itemDelete: No index!')
      if (!confirm('Delete item ?!')) return
      this.itemIndex = null
      this.$delete(this.node.items, index)
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
