<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- layers list
  div(v-if="storePlayer").col.full-width
    div(:style=`{position: 'relative'}`).column.fit
      //- header
      div(
        v-if="false"
        :style=`{}`).row.full-width.justify-center
        div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center.q-py-xs
          q-btn(round flat dense color="grey-4" icon="search")
          .col
          q-btn(round flat dense color="grey-4" icon="sort")
      //- body
      .col.full-width.scroll
        .row.full-width.justify-center.q-py-sm
          div(:style=`{maxWidth: storeEditor.layerEditing ? '600px' : '680px'}`).row.full-width.justify-center
            draggable(
              :list="composition.layers" group="layers" :sort="true" handle=".layer-drag-handle"
              @start="layersDragging = true"
              @end="layersDragging = false").full-width
              div(
                v-for="(l,li) in composition.layers" :key="li"
                v-show="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
                :style=`{}`
                ).row.full-width.items-start.content-start.q-mb-xs
                //- left: select
                div(
                  v-if="!storeEditor.layerEditing"
                  :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-checkbox(
                    v-model="layersSelected" :val="l.id"
                    dark dense color="grey-6"
                    :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
                //- middle: input name, layer editor...
                .col.full-height
                  layer-editor(
                    @delete="layerDelete(l)"
                    @createNode="layersSelectedCreateNode([l.id])"
                    :layer="l")
                //- right: drag
                div(
                  v-if="!storeEditor.layerEditing"
                  :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-btn(
                    round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
                    kalpa-menu-popup(:actions="layerActions" :value="l")
            //- layer ADD
            div(
              v-if="!storeEditor.layerEditing"
              :style=`{}`).row.full-width.justify-center
              div(:style=`{maxWidth: '600px'}`).row.full-width
                q-btn(
                  @click="layerAdd()"
                  flat color="green" icon="add"
                  :style=`{height: '40px'}`
                  ).full-width.b-60
      //- footer: layers selected
      div(
        v-if="layersSelected.length > 0"
        :style=`{
          position: 'absolute', zIndex: 1000, bottom: '0px',
        }`).row.full-width.justify-center
        div(
          :style=`{
            height: '50px', maxWidth: '680px',
            borderRadius: '10px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-70
          q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []")
          q-btn(flat dense color="red" no-caps).q-px-sm Delete
          .col
          q-btn(flat dense color="green" no-caps).q-px-sm Create node
  //- footer: something
  div(
    v-if="!storeEditor.layerEditing"
    :style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '600px'}`).row.full-width.items-center.content-center
      .row.full-width.q-py-sm
        q-input(
          v-model="composition.name"
          filled dark color="white"
          ).full-width
      composition-progress(:composition="composition" :storeEditor="storeEditor" :storePlayer="storePlayer")
</template>

<script>
import draggable from 'vuedraggable'
import layerEditor from './layer_editor'
import compositionProgress from './composition_progress'
// import compositionController from './composition_controller'

export default {
  name: 'pageEdit',
  components: {draggable, layerEditor, compositionProgress},
  props: ['composition'],
  inject: ['sidPlayer', 'sidEditor'],
  data () {
    return {
      layersSelected: [],
      layerDragging: false,
    }
  },
  computed: {
    storeEditor () {
      return window.stores[this.sidEditor]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
    layerActions () {
      let res = {
        edit: {
          name: 'Edit',
          fn: (layer) => this.layerEdit(layer)
        },
        // copy: {
        //   name: 'Copy',
        //   fn: (layer) => this.layerCopy(layer)
        // },
      }
      if (this.composition.layers.length > 1) {
        res.delete = {
          name: 'Delete',
          fn: (layer) => this.layerDelete(layer)
        }
      }
      return res
    }
  },
  methods: {
    layerEdit (layer) {
      this.$log('layerEdit', layer)
      this.storeEditor.layerPlaying = layer.id
      this.storeEditor.layerEditing = layer.id
    },
    layerDelete (layer) {
      this.$log('layerDelete', layer)
      if (this.composition.layers.length === 1) return
      if (!confirm('Delete layer ?')) return
      // unset in storeEditor
      this.storeEditor.layerPlaying = null
      this.storeEditor.layerEditing = null
      // delete from composition
      let i = this.composition.layers.findIndex(l => l.id === layer.id)
      this.$log('i', i)
      if (i >= 0) this.$delete(this.composition.layers, i)
    },
    layerAdd () {
      this.$log('layerAdd')
      let id = this.storeEditor.layerAdd()
      this.layerEdit({id})
    },
    layersSelectedCreateNode (arr) {
      this.$log('layersSelectedCreateNode', arr)
    },
    layersSelectedDelele () {
      this.$log('layersSelectedDelete')
    },
  },
  mounted () {
    this.$log('mounted')
  },
}
</script>
