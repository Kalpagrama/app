<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  q-dialog(
    v-model="itemEditorOpened" position="bottom"
    maximized
    @show="itemsActive = false"
    @hide="itemsActive = true")
    item-editor(:item="item" @close="itemEditorOpened = false")
  q-dialog(
    v-model="itemFinderOpened" position="bottom"
    @show="itemsActive = false"
    @hide="itemsActive = true")
    item-finder(@item="itemFound" @close="itemFinderOpened = false")
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px', overflow: 'hidden',
      minHeight: '400px',
    }`).row.full-width.b-40
    //- empty
    div(
      v-if="node.items.length === 0"
      :style=`{height: '400px'}`
      ).row.full-width
      q-btn(
        @click="itemFind()"
        round flat color="green" icon="add" size="lg").fit
    //- one
    div(
      v-if="node.items.length > 0"
      :style=`{height: '400px', paddingRight: '50px'}`
      ).row.full-width
      //- item wrapper
      div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-60
        //- one
        div(
          v-if="node.items.length === 1"
          :style=`{position: 'relative',}`
          ).row.fit
          q-btn(
            @click="itemDelete(node.items[0], 0)"
            round color="red" icon="delete_outline"
            :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', left: '8px',}`)
          q-btn(
            @click="itemEdit(node.items[0])"
            round color="green" icon="edit"
            :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', right: '8px',}`)
          item-player(:isActive="itemsActive" :item="node.items[0]" :itemIndex="0")
        //- two
        div(
          v-if="node.items.length === 2"
          :style=`{position: 'relative',}`
          ).row.fit
          .col.full-height
            q-btn(
              @click="itemDelete(node.items[0], 0)"
              round color="red" icon="delete_outline"
              :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', left: '8px',}`)
            q-btn(
              @click="itemEdit(node.items[0])"
              round color="green" icon="edit"
              :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', right: '8px',}`)
            item-player(:isActive="itemsActive" :item="node.items[0]" :itemIndex="0")
          .col.full-height
            q-btn(
              @click="itemDelete(node.items[0], 0)"
              round color="red" icon="delete_outline"
              :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', left: '8px',}`)
            q-btn(
              @click="itemEdit(node.items[0])"
              round color="green" icon="edit"
              :style=`{position: 'absolute', zIndex: 99999, top: 'calc(50% - 20px)', borderRadius: '50%', right: '8px',}`)
            item-player(:isActive="itemsActive" :item="node.items[0]" :itemIndex="0")
        //- two, three, four, five, six, seven,
      q-btn(
        @click="itemFind()"
        round flat color="green" icon="add"
        :style=`{position: 'absolute', zIndex: 100, top: '0px', right: '0px', width: '50px', height: '100%'}`)
</template>

<script>
import itemPlayer from './item_player.vue'
import itemEditor from './item_editor.vue'
import itemFinder from './item_finder.vue'

export default {
  name: 'wsNodeEditor__editItems',
  components: {itemPlayer, itemEditor, itemFinder},
  props: ['node'],
  data () {
    return {
      slide: null,
      itemsActive: true,
      itemEditorOpened: false,
      itemFinderOpened: false,
    }
  },
  watch: {
    // node: {
    //   immediate: true,
    //   handler (to, from) {
    //     this.slide = to.items[0].id
    //   }
    // }
  },
  methods: {
    itemAdd () {
      this.$log('itemAdd')
    },
    itemEdit (item, itemIndex) {
      this.$log('itemEdit', item, itemIndex)
      this.itemsActive = false
      this.item = item
      this.itemEditorOpened = true
    },
    itemFind () {
      this.$log('itemFind')
      this.itemFinderOpened = true
    },
    itemFound (item) {
      this.$log('itemFound', item)
      if (this.node.name.length === 0) {
        this.node.name = item.name
      }
      item.items.map(i => {
        this.node.items.push(i)
      })
      this.itemFinderOpened = false
    },
    itemDelete (item, itemIndex) {
      this.$log('itemDelete', item, itemIndex)
      if (!confirm('Delete item?')) return
      this.$delete(this.node.items, itemIndex)
    }
  }
}
</script>
