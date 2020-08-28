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
    maximized
    @show="itemsActive = false"
    @hide="itemsActive = true")
    item-finder(@item="itemFound" @close="itemFinderOpened = false")
  //- thumbnails
  //- q-carousel(
    swipeable
    animated
    v-model="slide"
    infinite
    :style=`{
      borderRadius: '10px',
    }`).full-width
    //- :img-src="i.thumbUrl"
    q-carousel-slide(
      v-for="(i,ii) in node.items" :key="i.id"
      :name="i.id"
      :style=`{
        padding: 0,
        margin: 0
      }`)
      edit-item(:item="i" :itemIndex="ii"
      @itemAdd="")
  div(:style=`{position: 'relative',}`).row.full-width
    item-player(:isActive="itemsActive" :item="node.items[0]" :itemIndex="0")
    //- q-btn(
      @click="itemAdd()"
      round push color="green" icon="add"
      :style=`{
        position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
        right: '20px', top: 'calc(50% - 20px)',
        borderRadius: '50%'
      }`)
    q-btn(
      @click="itemEdit(node.items[0], 0)"
      round color="green" icon="edit"
      :style=`{
        position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
        right: '20px', top: 'calc(50% - 20px)',
        borderRadius: '50%'
      }`)
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
    node: {
      immediate: true,
      handler (to, from) {
        this.slide = to.items[0].id
      }
    }
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
    itemFind () {},
    itemFound (item) {},
    itemDelete (item, itemIndex) {
      this.$log('itemDelete', item, itemIndex)
    }
  }
}
</script>
