<style lang="sass">
.q-checkbox__inner
  border-radius: 10px !important
  &:before
    border-radius: 10px !important
.item-tint
  cursor: pointer
  &:hover
    background: rgb(90,90,90) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- actions
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
          :options="{header: true, backButton: true, onItemClick: 'emit'}"
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
  //- add first item
  div(v-if="node.items.length === 0").column.fit.b-40
    slot(name="header")
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
      span(:style=`{fontSize: '16px'}`).text-white.text-bold Select first item
    div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width.q-pa-sm
      ws-item-finder(
        :types="['contentNotes', 'node']"
        :options=`{
          editing: false,
          onItemClick: 'emit'
        }`
        @item="itemFound"
        @cancel="itemFinderOpened = false"
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden'
        }`)
  //- items
  div(v-else :style=`{position: 'relative'}`).column.fit
    div(:style=`{position: 'relative'}`).col.full-width.scroll
      slot(name="header")
      div(
        :style=`{
          position: 'sticky', top: '-20px', zIndex: 1000,
          marginTop: '-20px', paddingTop: '30px',
          borderRadius: '0 0 10px 10px'
        }`).row.full-width.q-pt-md.q-pb-sm.q-px-sm.b-80
        div(:style=`{width: itemsEditToolsWidth+'px'}`).row.full-height
        q-btn(
          flat round icon="view_headline" @click="itemsView = 'list'"
          :color="itemsView === 'list' ? 'green' : 'white'").b-90.q-mr-sm
        q-btn(
          flat round icon="view_agenda" @click="itemsView = 'feed'"
          :color="itemsView === 'feed' ? 'green' : 'white'").b-90
        .col
          .row.fit.items-center.content-center.justify-end
            q-btn(flat round color="white" icon="edit" @click="itemsEdit()").b-90
      //- items
      div(
        v-if="node.items.length > 0"
        ).row.full-width.items-start.content-start.q-pa-sm
        //- items
        div(
          v-for="(i, ii) in node.items" :key="i.oid"
          :ref="`item-${i.oid}`"
          :class=`{}`
          :style=`{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: itemsEditToolsMarginBottom+'px'
          }`
          ).row.full-width.items-start.content-start
          div(:style=`{width: itemsEditToolsWidth+'px', overflow: 'hidden'}`).row.justify-start
            q-checkbox(v-model="itemsSelected" :val="i.oid" dark color="grey-6")
          div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.b-70
            div(:style=`{position: 'relative', height: itemsView === 'list' ? '40px' : '500px'}`).column.full-width
              div(
                v-if="itemsView === 'feed'"
                :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).col.full-width.b-60
                composition(
                  ctx="workspace"
                  :value="i" :visible="true" :active="false" :mini="false")
              //- item footer
              div(
                @click="itemsOpened.push(i.oid)"
                :class=`{
                  'item-tint': itemsView === 'list'
                }`
                :style=`{position: 'relative', height: '50px'}`).row.full-width.items-center.content-center.q-px-md
                span(:style=`{userSelect: 'none'}`).text-white Item name
          div(:style=`{width: itemsEditToolsWidth+'px', overflow: 'hidden'}`).row.justify-end
            q-btn(flat round color="grey-6" icon="drag_indicator")
              q-menu
                item-menu
          //- //- item-active(:item="i" :itemIndex="ii")
          //- //- item-footer
          //- div(
          //-   :style=`{
          //-     marginTop: '-10px'
          //-   }`
          //-   ).row.full-width.items-center.content-center.q-px-sm.q-pt-md.q-pb-sm.b-70.br
          //-   q-checkbox(v-model="itemsSelected" :val="i.oid" dark dense color="grey-6"
          //-     :style=`{borderRadius: '10px', padding: '10px'}`).b-90
          //-   .col
          //-   q-btn(round flat color="white" icon="more_vert").b-90
        //- ADD second and beyond items
        div(v-if="node.items.length > 0").row.full-width.q-pb-sm
          div(:style=`{width: itemsEditToolsWidth+'px'}`).row
          div(:style=`{}`).col
            q-btn(
              push no-caps color="green" icon="add" @click="itemFind()"
              :style=`{height: '40px'}`).full-width
          div(:style=`{width: itemsEditToolsWidth+'px'}`).row
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      div(
        v-if="itemsSelected.length > 0"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-pa-sm.b-100
        q-btn(flat color="white").q-mr-sm.b-120 {{itemsSelected.length}}
        q-btn(flat no-caps color="white" @click="itemsSelectedDrop()").q-mr-sm.b-110 Drop
        q-btn(flat no-caps color="white" @click="itemsSelectedDelete()").b-110 Delete
</template>

<script>
import assert from 'assert'
import itemActive from './item_active'
import itemMenu from './item_menu'

export default {
  name: 'nodeEditor-editItems',
  components: {itemActive, itemMenu},
  props: {
    node: {type: Object}
  },
  data () {
    return {
      itemFinderOpened: false,
      itemEditorOpened: false,
      itemsSelected: [],
      itemsOpened: [],
      itemsEditToolsWidth: 0,
      itemsEditToolsMarginBottom: 4,
      itemsEditing: false,
      itemsView: 'list'
    }
  },
  computed: {
  },
  watch: {
    itemsView: {
      handler (to, from) {
        this.$log('itemsView CHANGED', to)
        if (to === 'list') {
          this.$tween.to(this, 0.5, {
            itemsEditToolsMarginBottom: 4
          })
        }
        else if (to === 'feed') {
          this.$tween.to(this, 0.5, {
            itemsEditToolsMarginBottom: 16
          })
        }
      }
    },
    itemsEditing: {
      handler (to, from) {
        this.$log('itemsEditing CHANGED', to)
        if (to) {
          this.$tween.to(this, 0.5, {
            itemsEditToolsWidth: 50,
            // itemsEditToolsMarginBottom: 8,
          })
        }
        else {
          this.$tween.to(this, 0.5, {
            itemsEditToolsWidth: 0,
            // itemsEditToolsMarginBottom: 16
          })
        }
      }
    }
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
          let compositionInput = JSON.parse(JSON.stringify(item))
          // add layers workspace, non reactive...
          compositionInput.layersWorkspace = compositionInput.layers
          compositionInput.layers = []
          this.$log('compositionInput', compositionInput)
          this.$set(this.node.items, this.node.items.length, compositionInput)
          // this.itemEdit(compositionInput.oid)
          // await this.$wait(300)
          this.itemFinderOpened = false
          break
        }
        default: {
          alert(`NO SUCH TYPE: ${type}`)
          this.$log('No such type!')
        }
      }
    },
    itemEdit (oid) {
      this.$log('itemEdit', oid)
      // if (this.itemsEdit[oid] === true) {
      //   this.$set(this.itemsEdit, oid, false)
      // }
      // else {
      //   this.$set(this.itemsEdit, oid, true)
      // }
      // let ref = this.$refs[`item-${oid}`][0]
      // this.$log('ref', ref.offsetTop)
      // this.$emit('scrollTo', ref.offsetTop - 8)
      // ref.scrollIntoView(true)
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
    itemsEdit () {
      this.$log('itemsEdit', this.itemsEditing)
      this.itemsEditing = !this.itemsEditing
    },
    itemsSelectedDelete () {
      this.$log('itemsSelectedDelete')
      if (!confirm('Delete items ?!')) return
      this.itemsSelected.map(oid => {
        let i = this.node.items.findIndex(item => item.oid === oid)
        this.$log('itemsSelectedDelete i', i)
        if (i >= 0) {
          this.$delete(this.node.items, i)
        }
      })
    },
    itemsSelectedDrop () {
      this.$log('itemsSelectedDrop')
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
