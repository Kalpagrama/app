<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- item find
  q-dialog(
    v-model="itemFinderOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])")
    item-finder(
      @item="itemFound"
      @close="itemFinderOpened = false"
      :style=`{
        height: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`)
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
            item-item(
              @edit="itemEdit(i,ii)"
              @copy="itemCopy(i,ii)"
              @delete="itemDelete(i,ii)"
              :item="i" :itemIndex="itemIndex"
              :style=`{}`).q-mb-sm.b-70.item-drag-handle
        //- add item
        div(
          v-if="node.items.length < 3"
          ).row.full-width.q-mb-sm
          q-btn(
            @click="itemAdd()"
            flat color="green" icon="add" size="lg"
            :style=`{height: '300px'}`
            ).full-width.b-60
  //- footer
  .row.full-width.justify-center.br
    div(:style=`{maxWidth: '600px'}`).row.full-width.q-py-sm
      .col
      q-btn(push color="green" no-caps @click="stateNodeEditor.set('pageId', 'spheres')") Next
</template>

<script>
import draggable from 'vuedraggable'

import itemFinder from './item_finder'
import itemItem from './item_item'

export default {
  name: 'editItems',
  components: {draggable, itemFinder, itemItem},
  props: ['stateNodeEditor', 'node'],
  data () {
    return {
      item: null,
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemsDragging: false,
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item)
      let itemIndex = this.node.items.length
      this.$set(this.node.items, itemIndex, item)
      await this.$wait(300)
      this.itemEdit(this.node.items[itemIndex], itemIndex)
    },
    itemEdit (i, ii) {
      this.$log('itemEdit', i, ii)
      this.item = i
      this.itemEditorOpened = true
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
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
