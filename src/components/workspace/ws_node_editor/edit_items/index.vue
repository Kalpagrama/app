<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- item add
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="node.items.length > 0 && itemsSelected.length === 0 && !itemEditorOpened"
      push round color="green" icon="add" @click="itemAdd()"
      :size="$q.screen.gt.xs ? 'xl' : 'lg'"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '10px',
        right: '10px',
        borderRadius: '50%'
      }`)
  //- item find
  q-dialog(v-model="itemFinderOpened" position="bottom")
    ws-content-list(ctx="nodeEditor" @layer="layerFound"
      :style=`{
        maxWidth: 600+'px',
        maxHeight: 600+'px',
        minHeight: 600+'px',
        height: $q.screen.height+'px',
        borderRadius: '10px',
        overflow: 'hidden'
      }`)
      template(v-slot:header)
        div(:style=`{height: '60px', marginBottom: '20px'}`).row.full-width.items-center.content-center.q-px-sm
          q-btn(round flat icon="keyboard_arrow_left" @click="itemFinderOpened = false")
          span.text-white.text-bold Find item
  //- item edit
  q-dialog(v-model="itemEditorOpened" position="bottom")
    ws-content-editor(
      v-if="item"
      editorType="composition" :value="item"
      @close="itemEditorOpened = false"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`)
  //- header
  div(
    v-if="node.items.length > 0"
    :style=`{}`).row.full-width.q-pa-sm
    q-btn(
      round @click="itemsEditing = !itemsEditing"
      :flat="!itemsEditing"
      :color="itemsEditing ? 'green' : 'white'"
      :icon="itemsEditing ? 'check' : 'edit'"
      ).b-70.q-mr-sm
    q-btn(round flat color="white" icon="search").b-70
  //- footer
  div(:style=`{height: '50px', order: 1000}`).row.full-width
  //- body
  div(
    :style=`{
      position: 'relative',
      overflowX: 'hidden',
    }`).col.full-width.scroll
    //- items
    div(v-if="node.items.length > 0").row.full-width.items-start.content-start.q-px-sm
      draggable(
        :list="node.items" group="items" handle=".item-drag-handle"
        @start="itemsDragging = true"
        @end="itemsDragging = false").full-width
        div(
          v-for="(i,ii) in node.items" :key="i.id"
          ).row.full-width
          //- left
          div(
            :style=`{
              overflow: 'hidden',
              width: '50px', height: '50px',
              maxWidth: itemsEditingToolsWidth+'px'
            }`).row.justify-end
            q-checkbox(v-model="itemsSelected" :val="i.id" dark color="grey-6")
          //- center
          .col
            item-item(
              @edit="itemEdit(i,ii)"
              :item="i" :itemIndex="itemIndex"
              :style=`{}`)
          //- right
          div(
            :style=`{
              overflow: 'hidden',
              width: '50px', height: '50px',
              maxWidth: itemsEditingToolsWidth+'px'
            }`).row.justify-start
            q-btn(round flat color="white" icon="drag_indicator").fit.item-drag-handle
    //- add first item
    div(v-else).row.fit.items-center.content-center.justify-center.q-pa-md
      ws-content-list(
        ctx="nodeEditor" @layer="layerFound"
        :style=`{
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '10px',
          overflow: 'hidden'
        }`).full-height.b-50
        template(v-slot:header)
          div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
            span(:style=`{fontSize: '16px'}`).text-white.text-bold Add first item
    //- items selected
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="itemsSelected.length > 0"
        :style=`{
          position: 'absolute', zIndex: 1000,
          bottom: '0px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).row.full-width.b-70.q-pa-sm
        q-btn(round flat color="white" icon="clear" @click="itemsSelectedDrop()").b-90.q-mr-sm
        //- q-btn(flat color="white" no-caps @click="itemsSelectedCopy()") Copy
        q-btn(flat color="white" no-caps @click="itemsSelectedDelete()").b-90 Delete
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
      itemsEditing: false,
      itemsEditingToolsWidth: 0,
      itemsSelected: [],
      itemsDragging: false
    }
  },
  computed: {
  },
  watch: {
    itemsEditing: {
      handler (to, from) {
        // this.$log('itemsEditing CHANGED', to)
        this.$tween.to(this, 0.3, {itemsEditingToolsWidth: to ? 50 : 0})
      }
    }
  },
  methods: {
    itemsSelectedDrop () {
      this.$log('itemsSelectedDrop')
      this.itemsSelected = []
    },
    itemsSelectedDelete () {
      this.$log('itemsSelectedDelete start')
      if (!confirm('Delete items ?!')) return
      this.itemsSelected.map(id => {
        let i = this.node.items.findIndex(item => item.id === id)
        if (i >= 0) {
          this.$delete(this.node.items, i)
        }
      })
      this.$log('itemsSelectedDelete done')
      this.itemsSelectedDrop()
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
    contentFound () {
      this.$log('contentFound')
    },
    layerFound (layer) {
      this.$log('layerFound', layer)
      let itemIndex = this.node.items.length
      let itemId = Date.now().toString()
      let itemInput = {
        id: itemId,
        name: '',
        layers: [layer],
        spheres: [],
        contentType: 'VIDEO',
        operation: {
          items: null,
          operations: null,
          type: 'CONCAT'
        }
      }
      this.$set(this.node.items, itemIndex, itemInput)
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
