<template lang="pug">
.column.fit
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      //- dialogs
      //- ws item finder dialog
      q-dialog(v-model="itemFinderOpened" maximized position="bottom")
        div(:style=`{height: $q.screen.height+'px', paddingTop: paddingTop+'px'}` @click.self="itemFinderOpened = false"
          ).row.full-width.items-start.content-start.justify-center.q-px-sm
          div(
            :style=`{
              position: 'relative',
              maxWidth: $store.state.ui.maxWidthPage+'px',
              borderRadius: '10px', overflow: 'hidden',
              height: $q.screen.height-8-8+'px'
            }`).row.full-width.bg-grey-9
            ws-item-finder(
              v-if="true"
              :types="['contentNotes', 'node']"
              @item="itemFound"
              @cancel="itemFinderOpened = false")
      //- composition editor dialog
      q-dialog(v-model="itemEditorOpened" maximized position="bottom")
        div(:style=`{height: $q.screen.height+'px', paddingTop: 0+'px'}` @click.self="itemEditorOpened = false"
          ).row.full-width.items-start.content-start.justify-center.q-px-sm
          div(
            :style=`{
              position: 'relative', zIndex: 200, transform: 'translate3d(0,0,0)',
              maxWidth: $store.state.ui.maxWidthPage+'px',
              borderRadius: '10px', overflow: 'hidden',
              height: $q.screen.height+'px'
            }`
            ).row.full-width
            composition-editor(
              v-if="node.items[itemIndex]"
              :composition="node.items[itemIndex]" :content="node.items[itemIndex].content"
              @cancel="itemEditorOpened = false"
              ).bg-grey-8
      //- items
      div(
        v-for="(i, ii) in node.items" :key="i.oid"
        :class=`{}`
        :style=`{
          position: 'relative',
          height: '860px',
          borderRadius: '10px',
          overflow: 'hidden',
          maxHeight: itemsEdit[i.oid] ? '860px' : '460px',
        }`
        ).row.full-width.q-mb-sm
        //- composition actions LEFT: select, mini
        div(
          :style=`{width: '60px'}`
          ).row.full-height.justify-center.items-between.content-between.q-px-sm
          q-checkbox(v-model="itemsSelected" :val="i.oid" dark dense color="grey-6"
            :style=`{borderRadius: '10px', padding: '10px'}`).bg-grey-9
          q-btn(
            round flat color="grey-6" @click="itemsEdit[i.oid] = false"
            :icon="itemsEdit[i.oid] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'").bg-grey-9
        //- composition container
        div(
          @mouseenter="itemsActive[i.oid] = true"
          @mouseleave="itemsActive[i.oid] = false"
          :style=`{position: 'relative', maxWidth: '100%'}`).col.full-height
          composition(
            ctx="workspace"
            :value="i"
            :visible="true"
            :active="true"
            :mini="false"
            :styles=`{
              paddingBottom: itemsEdit[i.oid] === true ? '480px' : '0px'
            }`)
            template(v-slot:editor=`{content, player, meta}`)
              composer(
                v-if="itemsEdit[i.oid]"
                ctx="workspace"
                :composition="i"
                :player="player" :meta="meta"
                @meta="$parent.emit('meta', $event)"
                @cancel="$emit('cancel')"
                :styles=`{
                  paddingBottom: itemsEdit[i.oid] === true ? 460 : 0
                }`)
        //- composition actions RIGHT: delete, edit, add
        div(:style=`{width: '60px'}`).row.full-height.justify-center.items-between.content-between.q-px-sm
          q-btn(round flat color="grey-6" icon="drag_indicator").bg-grey-9
          q-btn(round flat color="red-5" icon="delete_outline" @click="itemDelete(i.oid)"
            :style=`{background: 'rgba(0,0,0,0.1)'}`).bg-grey-9
          q-btn(round flat color="white" icon="edit" @click="itemEdit(i.oid)").bg-grey-9
      //- add first item
      div(v-if="node.items.length === 0").row.full-width.q-px-sm
        q-btn(
          flat icon-right="add" color="green" no-caps @click="itemFind()"
          :style=`{height: '400px'}`).full-width.bg-grey-8
          span.text-bold Add item
      //- add second and beyond items
      div(v-if="node.items.length > 0").row.full-width
        div(:style=`{width: '60px'}`).row.q-pa-sm
        .col.q-pb-sm
          q-btn(flat no-caps color="green" icon="add" @click="itemFind()"
            :style=`{height: '42px'}`).full-width.bg-grey-9
        div(:style=`{width: '60px'}`).row.q-pa-sm
  //- footer
  div(
    v-if="itemsSelected.length > 0"
    :style=`{minHeight: '60px'}`).row.full-width
    div(
      :style=`{height: '60px'}`).row.full-width.bg-grey-9
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="grey-2").bg-grey-8
          span.text-bold {{itemsSelected.length}}
      .col.full-height
        .row.fit.items-center.content-center.q-px-sm
          q-btn(flat no-caps color="red" @click="itemsSelectedDelete()") Delete
          q-btn(flat no-caps color="grey-6" @click="itemsSelectedDiscard()") Discard
</template>

<script>
import assert from 'assert'
import composer from 'components/node/composition_editor/video_composer/composer'

export default {
  name: 'nodeEditor-editItems',
  components: {composer},
  props: {
    node: {type: Object}
  },
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemsSelected: [],
      itemsActive: {},
      itemsMaxi: {},
      itemsEdit: {}
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    itemFind () {
      this.$log('itemFind')
      this.itemFinderOpened = true
    },
    async itemFound ({type, item}) {
      this.$log('itemFound', type, item)
      // set node.name if there is no node.name and we have layer.name. in items...
      switch (type) {
        case 'contentNotes': {
          let compositionInput = JSON.parse(JSON.stringify(item.rawData))
          // add layers workspace, non reactive...
          compositionInput.oid = Date.now().toString()
          compositionInput.layersWorkspace = compositionInput.layers
          compositionInput.layers = []
          this.$set(this.node.items, this.node.items.length, compositionInput)
          this.itemEdit(compositionInput.oid)
          await this.$wait(300)
          this.itemFinderOpened = false
          break
        }
        default: {
          this.$log('No such type!')
        }
      }
    },
    itemEdit (oid) {
      this.$log('itemEdit', oid)
      // this.$set(this.itemsMaxi, oid, true)
      this.$set(this.itemsEdit, oid, true)
      // this.itemsMaxi[oid] = true
      // this.itemsEdit[oid] = true
    },
    itemDelete (oid) {
      this.$log('itemDelete', oid)
      if (!confirm('Delete item ?!')) return
      let i = this.node.items.findIndex(item => item.oid === oid)
      this.$log('itemDelete i', i)
      if (i) {
        this.$delete(this.node.items, i)
      }
    },
    itemsSelectedDelete () {
      this.$log('itemsSelectedDelete')
      if (!confirm('Delete items ?!')) return
      this.itemsSelected.map(oid => {
        let i = this.node.items.findIndex(item => item.oid === oid)
        this.$log('itemsSelectedDelete i', i)
        if (i) {
          this.$delete(this.node.items, i)
        }
      })
    },
    itemsSelectedDiscard () {
      this.$log('itemsSelectedDiscard')
      this.$set(this, 'itemsSelected', [])
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
