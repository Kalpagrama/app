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
        div(v-if="node.items.length === 1").row.fit
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
    itemFound (item) {},
    itemDelete (item, itemIndex) {
      this.$log('itemDelete', item, itemIndex)
    }
  }
}
</script>
