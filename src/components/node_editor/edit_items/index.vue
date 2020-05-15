<style lang="sass">
.q-checkbox__inner
  border-radius: 10px !important
  &:before
    border-radius: 10px !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
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
  //- header: edit
  div(
    v-if="true"
    :style=`{
      position: 'relative',
      marginTop: '-10px', borderRadius: '0 0 10px 10px'
    }`).row.full-width.q-pt-md.q-pb-sm.q-px-sm.b-80
    .col.full-height
      div(v-if="itemsSelected.length > 0").row.fit.items-center.content-center
        q-btn(flat no-caps color="white").q-mr-sm.b-90 {{itemsSelected.length}}
        q-btn(flat no-caps color="white").q-mr-sm.b-90 Drop selection
        q-btn(flat no-caps color="white").q-mr-sm.b-90 Delete
    q-btn(flat round color="white" icon="edit").b-90
  //- add first item
  div(v-if="true && node.items.length === 0").col.full-width.q-pa-sm
    div(:style=`{borderRadius: '10px'}`).column.fit.b-50
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
        span(:style=`{}`).text-white.text-bold Select first item
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width.b-50
        ws-item-finder(
          :types="['contentNotes', 'node']"
          :options=`{
            editing: false,
            onItemClick: 'emit'
          }`
          @item="itemFound"
          @cancel="itemFinderOpened = false")
  //- node.items
  div(v-if="true && node.items.length > 0").col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-sm
      //- items
      div(
        v-for="(i, ii) in node.items" :key="i.oid"
        :ref="`item-${i.oid}`"
        :class=`{}`
        :style=`{
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden'
        }`
        ).row.full-width.items-start.content-start.q-mb-sm
        item-active(:item="i" :itemIndex="ii")
        //- item-footer
        div(
          :style=`{marginTop: '-10px'}`
          ).row.full-width.items-center.content-center.q-px-sm.q-pt-md.q-pb-sm.b-70
          q-checkbox(v-model="itemsSelected" :val="i.oid" dark dense color="grey-6"
            :style=`{borderRadius: '10px', padding: '10px'}`).b-90
          .col
          q-btn(round flat color="white" icon="more_vert").b-90
      //- ADD second and beyond items
      div(v-if="node.items.length > 0").row.full-width
        .col.q-pb-sm
          q-btn(
            push no-caps color="green" icon="add" @click="itemFind()"
            :style=`{height: '60px'}`).full-width
  //- footer: items selected
  div(
    v-if="false"
    :style=`{overflow: 'hidden'}`).row.full-width
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
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
              q-btn(flat no-caps color="red" @click="itemsSelectedDelete()").b-80 Delete
              q-btn(flat no-caps color="grey-6" @click="itemsSelectedDrop()").b-80 Drop
</template>

<script>
import assert from 'assert'
import itemActive from './item_active'

export default {
  name: 'nodeEditor-editItems',
  components: {itemActive},
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
      if (this.itemsEdit[oid] === true) {
        this.$set(this.itemsEdit, oid, false)
      }
      else {
        this.$set(this.itemsEdit, oid, true)
      }
      let ref = this.$refs[`item-${oid}`][0]
      this.$log('ref', ref.offsetTop)
      this.$emit('scrollTo', ref.offsetTop - 8)
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
