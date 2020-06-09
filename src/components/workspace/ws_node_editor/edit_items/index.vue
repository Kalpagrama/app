<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`).column.fit
  //- item add btn
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //-   q-btn(
  //-     v-if="node.items.length > 0 && itemsSelected.length === 0 && !itemEditorOpened"
  //-     push round color="green" icon="add" @click="itemAdd()"
  //-     :size="$q.screen.gt.xs ? 'xl' : 'lg'"
  //-     :style=`{
  //-       position: 'absolute', zIndex: 1000,
  //-       bottom: '10px',
  //-       right: '10px',
  //-       borderRadius: '50%'
  //-     }`)
  //- item find
  q-dialog(
    v-model="itemFinderOpened" full-height position="left"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])")
    ws-content-list(
      ctx="nodeEditor" @content="contentFound"
      :inDialog="true"
      key="nodeEditor"
      :style=`{
        maxWidth: 600+'px',
        //- maxHeight: $q.screen.xs ? $q.screen.height-60+'px' : 800+'px',
        //- height: $q.screen.xs ? $q.screen.height-60+'px' : 800+'px',
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
  div(:style=`{position: 'relative', height: '50px'}`).row.full-width
    .row.full-width.q-pa-sm
      q-input(
        v-model="searchString"
        filled dark dense color="grey-6"
        label="Find item..."
        :style=`{}`).full-width
        template(v-slot:prepend)
          q-btn(
            flat dense color="grey-6" icon="search")
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="grey-6" icon="clear" @click="searchString = ''")
    //- header: selected
    div(
      v-if="itemsSelected.length > 0"
      :style=`{
        position: 'absolute', zIndex: 1000,
      }`
      ).row.full-width.q-pa-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-50.q-pa-xs
        q-btn(round flat dense color="white" icon="clear" @click="itemsSelectedDrop()").b-70.q-mr-sm.q-ml-sm
        q-btn(flat color="white" no-caps @click="itemsSelectedDelete()").b-70 Delete
  //- body
  div(
    :style=`{
      position: 'relative',
      overflowX: 'hidden',
    }`).col.full-width.scroll.q-py-md
    //- items
    div(v-if="node.items.length > 0").row.full-width.items-start.content-start.q-px-sm
      draggable(
        :list="node.items" group="items" handle=".item-drag-handle"
        @start="itemsDragging = true"
        @end="itemsDragging = false").full-width
        div(
          v-for="(i,ii) in items" :key="i.id"
          ).row.full-width
          //- left
          div(
            :style=`{
              overflow: 'hidden',
              width: '50px', height: '50px'
            }`).row.items-start.content-start.justify-end
            q-checkbox(v-model="itemsSelected" :val="i.id" dark color="grey-6")
          //- center
          .col.item-drag-handle
            item-item(
              @edit="itemEdit(i,ii)"
              @copy="itemCopy(i,ii)"
              @delete="itemDelete(i,ii)"
              :item="i" :itemIndex="itemIndex"
              :style=`{}`).q-mb-sm.b-70
      //- add item
      div(:style=`{paddingLeft: '50px'}`).row.full-width
        q-btn(
          @click="itemAdd()"
          flat color="green" icon="add"
          :style=`{height: '60px'}`
          ).full-width.b-60
    //- add first item
    div(v-else).row.fit.items-start.content-start.justify-center.q-pa-sm
      div(
        :style=`{}`
        ).row.full-width.justify-center.q-mb-sm
        div(:style=`{maxWidth: '700px', height: '400px', borderRadius: '10px'}`
          ).row.full-width.items-center.content-center.justify-center.b-60
          q-btn(round flat color="green" icon="add" size="xl" @click="itemAdd()")
          .row.full-width.justify-center
            span(:style=`{fontSize: '15px'}`).text-white Add first item
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
      itemsDragging: false,
      searchString: ''
    }
  },
  computed: {
    items () {
      return this.node.items.filter((i, ii) => {
        if (this.searchString.length > 0) {
          let nameRegExp = new RegExp(this.searchString, 'i')
          // let name = i.layers[0].spheres[0].name
          // return nameRegExp.test(l.layers[0].name)
          return true
        }
        else {
          return true
        }
      })
    }
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
      if (!confirm('Delete items ?!')) {
        this.itemsSelectedDrop()
        return
      }
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
