<style lang="sass">
.q-checkbox__inner
  border-radius: 10px !important
  &:before
    border-radius: 10px !important
.item-tint
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- item finder dialog
  q-dialog(v-model="itemFinderOpened" persistent position="bottom")
    div(
      :style=`{
        position: 'relative',
        maxWidth: 600+'px',
        height: $q.screen.height+'px',
        maxHeight: $q.screen.height*0.8+'px'
      }`).row.full-width
      ws-item-finder(
        v-if="true"
        :types="['contentNotes', 'node']"
        :options="{header: true, backButton: true, onItemClick: 'emit'}"
        @item="itemFound"
        @cancel="itemFinderOpened = false")
  //- item editor dialog
  q-dialog(v-model="itemEditorOpened" persistent position="bottom")
    div(
      :style=`{
        position: 'relative',
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`).row.full-width
      composition-editor(
        v-if="itemEditingIndex >= 0 && node.items[itemEditingIndex]"
        :ctx="'workspace'"
        :composition="node.items[itemEditingIndex]"
        @cancel="itemEditorOpened = false")
  //- add first item
  div(v-if="node.items.length === 0" :style=`{position: 'relative'}`).column.fit
    slot(name="header")
    div(:style=`{}`).row.full-width.items-center.content-center.q-pa-md
      span(:style=`{fontSize: '16px'}`).text-white.text-bold Select first item
    div(:style=`{overflow: 'hidden'}`).col.full-width.q-pa-sm
      ws-item-finder(
        :types="['content', 'node']"
        :options=`{
          editing: false,
          onItemClick: 'emit'
        }`
        @item="itemFound"
        @cancel="itemFinderOpened = false"
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden'
        }`)
  //- items
  div(v-else :style=`{position: 'relative'}`).column.fit
    div(:style=`{position: 'relative'}`).col.full-width.scroll
      slot(name="header")
      //- header
      div(
        v-if="false"
        :style=`{
          position: 'sticky', top: '-20px', zIndex: 1000,
          marginTop: '-20px', paddingTop: '30px',
          borderRadius: '0 0 10px 10px'
        }`).row.full-width.q-pt-md.q-pb-sm.q-px-sm.b-80.br
        div(:style=`{width: itemsEditToolsWidth+'px'}`).row.full-height
        q-btn(
          flat round icon="view_headline" @click="itemsView = 'list'"
          :color="itemsView === 'list' ? 'green' : 'white'").b-90.q-mr-sm
        q-btn(
          flat round icon="view_agenda" @click="itemsView = 'feed'"
          :color="itemsView === 'feed' ? 'green' : 'white'").b-90
        .col
          .row.fit.items-center.content-center.justify-end
            q-btn(
              flat round icon="edit" @click="itemsEdit()"
              :color="itemsEditing ? 'green' : 'white'").b-90
      //- items
      div(
        v-if="node.items.length > 0"
        ).row.full-width.items-start.content-start.q-pa-sm
        //- items
        draggable(
          :list="node.items" group="items" handle=".item-drag-handle"
          :move="itemsOnDrag"
          @start="itemsDragging = true"
          @end="itemsDragging = false, itemsDraggingIndexNext = null").full-width
          div(
            v-for="(i, ii) in node.items" :key="i.oid"
            :ref="`item-${i.oid}`"
            :class=`{}`
            :style=`{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '10px'
            }`
            ).row.full-width.items-start.content-start
            //- LEFT: select
            div(:style=`{width: itemsEditToolsWidth+'px', overflow: 'hidden'}`).row.justify-start
              q-checkbox(v-model="itemsSelected" :val="i.oid" dark color="grey-6")
            //- CENTER: item, composition
            div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.b-70
              div(:style=`{position: 'relative', height: itemsView === 'list' ? '40px' : '500px'}`).column.full-width
                //- item body, composition, chain, ...
                div(
                  v-if="itemsView === 'feed'"
                  :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).col.full-width.b-60
                  composition(
                    ctx="workspace"
                    :value="i" :visible="true" :active="true" :mini="false")
                //- item footer
                div(
                  @click="itemsOpened.push(i.oid)"
                  :class=`{
                    'item-tint': itemsView === 'list'
                  }`
                  :style=`{
                    position: 'relative',
                    height: '50px'
                  }`
                  ).row.full-width.items-center.content-center.q-px-md
                  span(:style=`{userSelect: 'none'}`).text-white Item name {{ i.oid }}
                  q-btn(
                    round flat dense color="white" icon="edit" @click="itemEdit(i.oid)"
                    :style=`{position: 'absolute', zIndex: 100, right: '6px', bottom: '6px'}`).b-100
            //- RIGHT: menu, dragging
            div(:style=`{width: itemsEditToolsWidth+'px', overflow: 'hidden'}`).row.justify-end
              q-btn(flat round color="grey-6" icon="drag_indicator").item-drag-handle
                q-menu(auto-close anchor="top left" self="top right")
                  item-menu(@edit="itemEdit(i, ii)" @copy="itemCopy(i, ii)" @delete="itemDelete(i, ii)")
        //- ADD second and beyond items
        div(v-if="node.items.length > 0").row.full-width.q-pb-sm
          div(:style=`{width: itemsEditToolsWidth+'px'}`).row
          div(:style=`{}`).col
            q-btn(
              push no-caps color="green" icon="add" @click="itemFind()"
              :style=`{height: '40px'}`).full-width
          div(:style=`{width: itemsEditToolsWidth+'px'}`).row
    //- footer: selected items
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="itemsSelected.length > 0"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-pa-sm.b-100
        q-btn(flat color="white").q-mr-sm.b-120 {{itemsSelected.length}}
        q-btn(flat no-caps color="white" @click="itemsSelectedDrop()").q-mr-sm.b-110 Drop
        q-btn(flat no-caps color="white" @click="itemsSelectedDelete()").b-110 Delete
</template>

<script>
import assert from 'assert'
import itemMenu from './item_menu'
import draggable from 'vuedraggable'

export default {
  name: 'nodeEditor-editItems',
  components: {itemMenu, draggable},
  props: {
    node: {type: Object}
  },
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemsSelected: [],
      itemsOpened: [],
      itemsEditToolsWidth: 0,
      itemsEditToolsMarginBottom: 4,
      itemsEditing: false,
      itemEditingIndex: null,
      itemsView: 'list',
      itemsDragging: false,
      itemsDraggingIndexNext: null
    }
  },
  computed: {
  },
  watch: {
    itemsView: {
      handler (to, from) {
        this.$log('itemsView CHANGED', to)
        if (to === 'list') {
          this.$tween.to(this, 0.5, {
            itemsEditToolsMarginBottom: 4
          })
        }
        else if (to === 'feed') {
          this.$tween.to(this, 0.5, {
            itemsEditToolsMarginBottom: 16
          })
        }
      }
    },
    itemsEditing: {
      handler (to, from) {
        this.$log('itemsEditing CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.5, {
            itemsEditToolsWidth: 50,
            // itemsEditToolsMarginBottom: 8,
          })
        }
        else {
          this.$tween.to(this, 0.5, {
            itemsEditToolsWidth: 0,
            // itemsEditToolsMarginBottom: 16
          })
        }
      }
    }
  },
  methods: {
    itemFind () {
      this.$log('itemFind')
      this.itemFinderOpened = true
    },
    async itemFound ({type, item}) {
      this.$log('itemFound', type, item)
      // set node.name if there is no node.name and we have layer.name. in items...
      switch (type) {
        case 'content': {
          let compositionInput = JSON.parse(JSON.stringify(item))
          // add layers workspace, non reactive...
          compositionInput.layersWorkspace = compositionInput.layers
          compositionInput.layers = []
          this.$log('compositionInput', compositionInput)
          this.$set(this.node.items, this.node.items.length, compositionInput)
          this.itemFinderOpened = false
          break
        }
        default: {
          alert(`NO SUCH TYPE: ${type}`)
          this.$log('No such type!')
        }
      }
      // open editor for the first item
      if (this.node.items.length === 1) {
        this.itemEdit(null, 0)
      }
    },
    itemEdit (i, ii) {
      this.$log('itemEdit', i, ii)
      this.itemEditingIndex = ii
      this.itemEditorOpened = true
    },
    itemCopy ({oid}, ii) {
      this.$log('itemCopy', oid, ii)
      let item = JSON.parse(JSON.stringify(this.node.items[ii]))
      item.oid = Date.now().toString()
      this.node.items.splice(ii + 1, 0, item)
    },
    itemDelete ({oid}, ii) {
      this.$log('itemDelete', oid)
      if (!confirm('Delete item ?!')) return
      let index = this.node.items.findIndex(item => item.oid === oid)
      this.$log('itemDelete index', index)
      if (index >= 0) {
        this.$delete(this.node.items, index)
      }
    },
    itemsOnDrag (e, evt) {
      // this.$log('itemsOnDrag', e, evt)
      this.$log('itemsDraggingIndexNext', e.draggedContext.futureIndex)
      this.$set(this, 'itemsDraggingIndexNext', e.draggedContext.futureIndex + 1)
    },
    itemsEdit () {
      this.$log('itemsEdit', this.itemsEditing)
      this.itemsEditing = !this.itemsEditing
    },
    itemsSelectedDelete () {
      this.$log('itemsSelectedDelete')
      if (!confirm('Delete items ?!')) return
      this.itemsSelected.map(oid => {
        let i = this.node.items.findIndex(item => item.oid === oid)
        this.$log('itemsSelectedDelete i', i)
        if (i >= 0) {
          this.$delete(this.node.items, i)
        }
      })
    },
    itemsSelectedDrop () {
      this.$log('itemsSelectedDrop')
      this.$set(this, 'itemsSelected', [])
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
