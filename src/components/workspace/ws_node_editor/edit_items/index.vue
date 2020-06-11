<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- item find
  q-dialog(
    v-model="itemFinderOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])")
    ws-content-list(
      ctx="nodeEditor" @content="contentFound"
      :inDialog="true"
      key="nodeEditor"
      :style=`{
        maxWidth: 800+'px',
        maxHeight: $q.screen.xs ? $q.screen.height-60+'px' : 800+'px',
        height: $q.screen.xs ? $q.screen.height-60+'px' : 800+'px',
        borderRadius: '10px',
        overflow: 'hidden',
      }`).b-30
      template(v-slot:header)
        div(:style=`{marginBottom: '20px'}`).row.full-width.items-center.content-center.q-pt-md
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderOpened = false").q-mr-sm
          span(:style=`{fontSize: '16px'}`).text-white.text-bold Find item
  //- item edit
  q-dialog(
    v-model="itemEditorOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])")
    ws-composition-editor(
      v-if="item"
      :value="item"
      @close="itemEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`)
  //- body
  div(
    :style=`{
      position: 'relative',
      overflowX: 'hidden',
    }`).col.full-width.scroll.q-py-lg
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width
        draggable(
          :list="node.items" group="items" handle=".item-drag-handle"
          @start="itemsDragging = true"
          @end="itemsDragging = false"
          ).full-width
          div(
            v-for="(i,ii) in node.items" :key="i.id"
            ).row.full-width.items-start.content-start
            //- left
            div(
              :style=`{
                overflow: 'hidden',
                width: '40px', height: '40px'
              }`).row.items-start.content-start.justify-center
              q-checkbox(v-model="itemsSelected" :val="i.id" dark color="grey-6")
            //- center
            .col
              item-item(
                @edit="itemEdit(i,ii)"
                @copy="itemCopy(i,ii)"
                @delete="itemDelete(i,ii)"
                :item="i" :itemIndex="itemIndex"
                :style=`{}`).q-mb-sm.b-70
            div(:style=`{width: '40px'}`)
              q-btn(round flat dense color="grey-6" icon="drag_indicator").item-drag-handle
                //- TODO: actions
        //- add item
        div(
          v-if="node.items.length < 4"
          ).row.full-width.q-mb-sm
          q-btn(
            @click="itemAdd()"
            flat color="green" icon="add" size="lg"
            :style=`{height: '280px'}`
            ).full-width.b-60
</template>

<script>
import itemItem from './item_item'
import draggable from 'vuedraggable'

export default {
  name: 'editItems',
  components: {itemItem, draggable},
  props: ['node'],
  data () {
    return {
      item: null,
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemsDragging: false,
    }
  },
  methods: {
    itemEdit (i, ii) {
      this.$log('itemEdit', i, ii)
      this.item = i
      this.itemEditorOpened = true
    },
    itemCopy (i, ii) {
      this.$log('itemCopy', i, ii)
    },
    itemAdd () {
      this.$log('itemAdd')
      this.itemFinderOpened = true
    },
    itemDelete (i, ii) {
      this.$log('itemDelete', i, ii)
      if (!confirm('Delete node ?!')) return
      this.$delete(this.node.items, ii)
    },
    contentFound (content) {
      this.$log('contentFound', content)
      // TODO: impl convert => content to composition => node.item
      let itemIndex = this.node.items.length
      let itemId = Date.now().toString()
      let itemInput = {
        id: itemId,
        name: '',
        layers: [],
        spheres: [],
        contentType: 'VIDEO',
        contentOid: content.contentOid,
        thumbUrl: content.thumbOid,
        operation: {items: null, operations: null, type: 'CONCAT'}
      }
      this.$set(this.node.items, itemIndex, itemInput)
      this.itemFinderOpened = false
      // set item, open editor
      this.item = this.node.items[itemIndex]
      this.itemEditorOpened = true
    }
  },
  mounted () {
    this.$log('mounted')
    // AJ2Ri_fCwB8=
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
