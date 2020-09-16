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
    item-finder(:id="node.id" @item="itemFound" @close="itemFinderOpened = false")
  div(
    :style=`{
      position: 'relative',
      borderRadius: '10px', overflow: 'hidden',
      minHeight: node.items.length === 0 ? '400px' : 'null',
    }`).row.full-width.items-start.content-start.b-40
    //- empty
    div(
      v-if="node.items.length === 0"
      :style=`{height: '400px'}`
      ).row.full-width
      q-btn(
        @click="itemFind()"
        round flat color="green" icon="add" size="xl").fit
    //- one
    div(
      v-if="node.items.length > 0"
      :style=`{paddingRight: '0px'}`
      ).row.full-width.items-start.content-start
      //- items list
      div().row.full-width.items-start.content-start
        div(
          v-for="(i,ii) in node.items" :key="i.id"
          :style=`{position: 'relative', minHeight: '200px',}`
          ).row.full-width.items-start.content-start
          q-btn(
            @click="itemDelete(i,ii)"
            round flat color="red" icon="delete_outline" size="xl"
            :style=`{position: 'absolute', zIndex: 300, top: 'calc(50% - 40px)', borderRadius: '50%', left: '8px',}`)
          q-btn(
            @click="itemEdit(i,ii)"
            round flat color="green" icon="edit" size="xl"
            :style=`{position: 'absolute', zIndex: 300, top: 'calc(50% - 40px)', borderRadius: '50%', right: '8px',}`)
          item-player(:isActive="itemsActive" :item="i" :itemIndex="ii")
        //- item add one more
        q-btn(
          @click="itemFind()"
          flat color="green" icon="add" no-caps
          :style=`{height: '50px'}`
          ).full-width {{ $t('Add fragment to node', 'Добавить фрагмент') }}
</template>

<script>
import itemPlayer from './item_player.vue'
import itemEditor from './item_editor.vue'
import itemFinder from './item_finder/index.vue'

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
      this.node.items.push(JSON.parse(JSON.stringify(item)))
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
