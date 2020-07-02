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
  //- modes
  div(v-if="false").row.ful-width.justify-center
    q-btn(
      v-for="m in modes" :key="m.id"
      @click="mode = m.id"
      round flat dense
      :color="m.id === mode ? 'green' : 'white'"
      :icon="m.icon")
  //- body
  div(
    :style=`{
      position: 'relative',
      overflowX: 'hidden',
    }`).col.full-width.scroll.q-py-lg
    //- mini
    div(v-if="mode === 'mini'").row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.q-px-sm
        draggable(
          :list="node.items" group="items" handle=".item-drag-handle"
          @start="itemsDragging = true"
          @end="itemsDragging = false"
          ).full-width
          div(
            v-for="(i,ii) in node.items" :key="i.id"
            :style=`{height: '100px'}`
            ).row.full-width.items-start.content-start.q-mb-sm
            .col
              item-item(
                @edit="itemEdit(i,ii)"
                @copy="itemCopy(i,ii)"
                @delete="itemDelete(i,ii)"
                :item="i" :itemIndex="itemIndex"
                :style=`{}`).q-mb-sm.b-70
            div(:style=`{}`).row.full-height.justify-center.q-pl-xs
              q-btn(flat color="white" icon="drag_indicator").full-height.item-drag-handle.b-60
        //- add item
        div(
          v-if="node.items.length < 3"
          :style=`{paddingRight: '64px',}`
          ).row.full-width.q-my-sm
          q-btn(
            @click="itemAdd()"
            flat color="green" icon="add" size="md" no-caps
            :style=`{height: '60px'}`
            ).full-width.b-60 {{$t('Добавить образ')}}
    //- medi
    div(v-if="mode === 'medi'").row.full-width.items-start.justify-center.q-px-xs.br
      draggable(
        :list="node.items" group="items" handle=".item-drag-handle"
        @start="itemsDragging = true"
        @end="itemsDragging = false"
        ).row.full-width
        div(
          v-for="(i,ii) in 3" :key="ii"
          :style=`{
            height: '300px',
            width: i.id+'-'+ii === itemSelected ? 'calc(100% - 50px - 50px)' : '50px',
          }`
          ).row.q-pa-xs
          div(
            v-if="node.items[ii]"
            @click="itemSelected = i.id + '-' + ii"
            :style=`{
              position: 'relative',
              borderRadius: '10px',overflow: 'hidden',}`).row.fit.b-60.item-drag-handle
            q-btn(
              v-if="itemSelected === i.id+'-'+ii"
              @click="itemDelete(i,ii)"
              round flat color="red" icon="delete_outline"
              :style=`{
                position: 'absolute', zIndex: 110, transform: 'translate3d(0,0,0)', top: '0px', left: '0px',
                background: 'rgba(0,0,0,0.5)',
              }`)
            q-btn(
              v-if="itemSelected === i.id+'-'+ii"
              @click="itemEdit(i,ii)"
              round flat color="white" icon="edit"
              :style=`{
                position: 'absolute', zIndex: 110, transform: 'translate3d(0,0,0)', bottom: '0px', right: '0px',
                background: 'rgba(0,0,0,0.5)',
              }`)
            span(
              :class=`{
                'rotate-270': itemSelected !== i.id+'-'+ii,
              }`
              :style=`{
                position: 'absolute', zIndex: 100, bottom: '0px',
                background: 'rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }`).text-white.q-px-md.q-py-sm.full-width {{ i.name }}
            img(:src="node.items[ii].thumbOid" :style=`{objectFit: 'cover'}`).fit
    //- maxi
    div(v-if="mode === 'maxi'").row.full-width
      draggable(
        :list="node.items" group="items" handle=".item-drag-handle"
        @start="itemsDragging = true"
        @end="itemsDragging = false"
        ).row.full-width
        div(
          v-for="(i,ii) in node.items" :key="i.id"
          :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden',}`
          ).row.full-width.cursor-pointer.q-mb-sm
          img(
            @click="itemEdit(i,ii)"
            :src="i.thumbOid" :style=`{height: '250px', objectFit: 'cover'}`).full-width
          //- delete
          q-btn(
            @click="itemDelete(i,ii)"
            round flat color="red" icon="delete_outline"
            :style=`{
              position: 'absolute', zIndex: 1000, top: 0, left: 0,
              background: 'rgba(0,0,0,0.1)',
            }`)
          //- drag
          q-btn(
            flat color="white" icon="drag_indicator"
            :style=`{
              position: 'absolute', zIndex: 1000, right: 0,
              width: '70px', height: '100%',
              background: 'rgba(0,0,0,0.1)',
              cursor: 'grabbing',
            }`
            ).item-drag-handle
          //- name
          span(
            v-if="i.name && i.name.length > 0"
            @click="itemEdit(i,ii)"
            :style=`{
              position: 'absolute', zIndex: 1000, bottom: 0, left: 0,
              background: 'rgba(0,0,0,0.2)', borderRadius: '10px', overflow: 'hidden',
              userSelect: 'none',
            }`
            ).text-white.text-bold.q-pa-sm {{ i.name }}
      q-btn(flat color="green" icon="add" no-caps :style=`{height: '50px',}` @click="itemAdd").full-width {{$t('add_item', 'Добавить образ')}}
</template>

<script>
import draggable from 'vuedraggable'

import itemFinder from './item_finder'
import itemItem from './item_item'

export default {
  name: 'editItems',
  components: {draggable, itemFinder, itemItem},
  props: ['storeNodeEditor', 'node', 'options'],
  data () {
    return {
      mode: 'maxi', // mini/medi/maxi
      modes: [
        {id: 'mini', icon: 'menu'},
        {id: 'medi', icon: 'view_week'},
        {id: 'maxi', icon: 'view_day'},
      ],
      item: null,
      itemSelected: null,
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
      await this.$wait(500)
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
      if (!confirm('Delete item ?!')) return
      this.$delete(this.node.items, ii)
    },
  },
  mounted () {
    this.$log('mounted')
    if (this.node.items.length === 0) {
      if (this.options.itemAdd) {
        this.itemAdd()
      }
    }
    else {
      this.itemSelected = this.node.items[0].id + '-' + 0
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
