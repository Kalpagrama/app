<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: height+'px',
    borderRadius: '10px', overflow: 'hidden',
  }`).row.full-width.b-80
  //- items settings reorder dialog
  q-dialog(v-model="settingsDialogOpened" position="bottom")
    div(
      :style=`{
        position: 'relative', minWidth: '400px', minHeight: '600px',
        borderRadius: '10px', overflow: 'hidden',
      }`).column.full-width.b-50
      //- header
      .row.full-width.items-center.content-center.justify-between.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="settingsDialogOpened = false")
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ $t('wsNodeEditor_editItemPip_itemsEditorTitle','Элементы ядра') }}
        q-btn(round flat color="white" icon="more_vert")
      //- body
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          draggable(
            :list="node.items" group="items" handle=".item-drag-handle"
            @start="itemsDragging = true"
            @end="itemsDragging = false"
            ).full-width
            div(
              v-for="(i,ii) in node.items" :key="ii"
              :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden',}`
              ).row.full-width.items-center.content-center.justify-between.b-80.q-mb-sm.item-drag-handle
              img(:src="i.thumbOid" :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden',}` draggable="false")
              .col.full-height
                .row.fit.items-center.content-center.q-pa-sm
                  span.text-white.text-bold {{ i.name }}
              q-btn(round flat color="white" icon="drag_indicator")
      //- footer
      .row.full-width
        q-btn(flat color="green" icon="check" no-caps @click="settingsDialogOpened = false").full-width Ready
  //- set first item
  q-btn(
    v-if="node.items.length === 0"
    @click="$emit('itemFind')"
    flat color="green" icon="add"
    size="xl"
    :style=`{
      position: 'absolute', zIndex: 900,
    }`
    ).fit
  //- kalpa-debug(:options=`{itemsActive}`)
  //- .row.full-width.q-pa-sm.bg-red
  //- list pip
  list-pip(
    v-if="node.items.length > 0"
    :items="node.items")
    template(v-slot:item=`{item,itemIsFirst,itemIsLast,itemIndex,itemActive,itemNexting,next,prev,started,ended}`)
      div(:style=`{position: 'relative'}`).row.fit
        div(
          v-if="!itemActive"
          :style=`{position: 'absolute', zIndex: 99999, borderRadius: '10px', overflow: 'hidden', opacity: 0.2}` @click="next()").row.fit.cursor-pointer.bg-green
        //- name
        q-btn(
          v-if="itemActive && item.name.length > 0"
          flat color="white" no-caps
          :style=`{
            position: 'absolute', zIndex: 999, top: '8px', left: '8px',
            background: 'rgba(0,0,0,0.5)',
          }`
          ) {{ item.name }}
        //- tools
        div(
          v-if="itemActive"
          :style=`{position: 'absolute', zIndex: 999, top: 'calc(50% - 70px)', right: 0,width: '40px',}`).row.justify-center
          q-btn(
            @click="$emit('itemDelete', itemIndex), itemsActive = false"
            round flat dense color="grey-5" icon="delete_outline").full-width
          q-btn(
            @click="$emit('itemEdit', item), itemsActive = false"
            color="green" icon="edit").full-width.q-py-md
          q-btn(
            @click="settingsDialogOpened = true"
            round flat dense color="grey-5" icon="sort"
            :style=`{transform: 'scaleX(-1)'}`
            ).full-width
        //- editor
        ws-composition-editor(
          @delete="$emit('itemDelete', itemIndex)"
          :sid="`wce-${itemIndex}`"
          :value="item"
          :options=`{
            isPreview: true,
            mode: 'player',
            active: itemsActive && itemActive,
            mini: !itemActive,
          }`
          :style=`{
            height: '100%',
          }`)
        //- next item
        q-btn(
          v-if="itemActive && itemIsLast && node.items.length < 5"
          @click="$emit('itemFind'), itemsActive = false"
          color="green" icon="add" size="lg"
          :style=`{
            position: 'absolute', zIndex: 9999, right: 0, bottom: 0,
            width: '25%', height: '25%',
            opacity: 0.9,
          }`)
          slot(name="next" :next="next")
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'editItemsPip',
  components: {draggable},
  props: ['node'],
  inject: ['sidNodeEditor'],
  data () {
    return {
      settingsDialogOpened: false,
      // itemsActive: true,
    }
  },
  computed: {
    nodeEditor () {
      return window.stores[this.sidNodeEditor]
    },
    itemsActive () {
      return !this.nodeEditor.itemEditorOpened &&
        !this.nodeEditor.itemFinderOpened &&
        !this.settingsDialogOpened
    },
    height () {
      if (this.$q.screen.width < 800) return this.$q.screen.width * 0.6
      else return 400
    }
  }
}
</script>
