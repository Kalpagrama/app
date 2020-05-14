<style lang="sass">
.q-checkbox__inner
  border-radius: 10px !important
  &:before
    border-radius: 10px !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  div(:style=`{marginTop: '-10px', borderRadius: '0 0 10px 10px'}`).row.full-width.q-pt-md.q-pb-sm.q-px-sm.b-80.q-mb-sm
    .col
    q-btn(flat round color="white" icon="edit")
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
          :options="{header: true, backButton: true}"
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
  div(v-if="node.items.length === 0").row.fit.q-px-sm.q-pb-sm
    div(:style=`{borderRadius: '10px'}`).column.fit.b-50
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
        span(:style=`{}`).text-white.text-bold Select first item
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width.b-50
        ws-item-finder(
          :types="['contentNotes', 'node']"
          :options="{}"
          @item="itemFound"
          @cancel="itemFinderOpened = false")
  //- node.items
  div(v-if="node.items.length > 0").row.full-width
    .row.full-width.items-start.content-start.q-px-sm
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
        div(:style=`{height: '500px'}`).row.full-width
          //- item actions LEFT: select, mini
          div(
            v-if="false"
            :style=`{width: '60px'}`
            ).row.full-height.justify-center.items-between.content-between.q-px-sm
            q-checkbox(v-model="itemsSelected" :val="i.oid" dark dense color="grey-6"
              :style=`{borderRadius: '10px', padding: '10px'}`).bg-grey-9
            q-btn(
              round flat color="white" @click="itemEdit(i.oid)"
              :icon="itemsEdit[i.oid] ? 'keyboard_arrow_up' : 'edit'").bg-grey-9
          //- item container
          div(
            @mouseenter="itemsActive[i.oid] = true"
            @mouseleave="itemsActive[i.oid] = false"
            :style=`{position: 'relative', maxWidth: '100%'}`).col.full-height
            composition-editor(
              ctx="workspace"
              :composition="i"
              :options=`{visible: true, active: true, mini: false}`)
          //- item actions RIGHT: delete, edit, add
          div(
            v-if="false"
            :style=`{width: '60px'}`).row.full-height.justify-center.items-between.content-between.q-px-sm
            q-btn(round flat color="grey-6" icon="drag_indicator").bg-grey-9
            q-btn(round flat color="red-5" icon="delete_outline" @click="itemDelete(i.oid)"
              :style=`{background: 'rgba(0,0,0,0.1)'}`).bg-grey-9
        //- footer
        div(
          :style=`{marginTop: '-10px'}`
          ).row.full-width.items-center.content-center.q-px-sm.q-pt-md.q-pb-sm.b-70
          q-checkbox(v-model="itemsSelected" :val="i.oid" dark dense color="grey-6"
            :style=`{borderRadius: '10px', padding: '10px'}`).b-90
          .col
          q-btn(round flat color="white" icon="more_vert").b-90
      //- ADD second and beyond items
      div(v-if="node.items.length > 0").row.full-width
        div(:style=`{width: '60px'}`).row.q-pa-sm
        .col.q-pb-sm
          q-btn(
            push no-caps color="green" icon="add" @click="itemFind()"
            :style=`{height: '60px'}`).full-width
        div(:style=`{width: '60px'}`).row.q-pa-sm
  //- footer: items selected
  div(:style=`{overflow: 'hidden'}`).row.full-width
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
          let compositionInput = JSON.parse(JSON.stringify(item))
          // add layers workspace, non reactive...
          // compositionInput.oid = Date.now().toString()
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
