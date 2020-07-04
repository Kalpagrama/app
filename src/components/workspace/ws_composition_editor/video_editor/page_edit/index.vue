<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header: composition.name, check:close
  //- composition.layers.length > 1 ? !storeEditor.layerEditing : true
  div(
    v-show="composition.layers.length > 1 ? !storeEditor.layerEditing : true"
    ).row.full-width.justify-center
    name-editor(
      :composition="composition" @close="$emit('close')"
      :style=`{maxWidth: '600px'}`)
  //- layers list
  div(v-if="storePlayer").col.full-width
    div(:style=`{position: 'relative'}`).column.fit
      //- body: layers, dragging
      .col.full-width.scroll
        .row.full-width.justify-center
          div(:style=`{maxWidth: storeEditor.layerEditing ? '680px' : '680px'}`).row.full-width.justify-center.q-pt-sm
            draggable(
              :list="composition.layers" group="layers" :sort="true" handle=".layer-drag-handle"
              @start="layersDragging = true"
              @end="layersDragging = false").full-width
              //- v-show="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
              //- v-if="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
              div(
                v-for="(l,li) in composition.layers" :key="li"
                v-show="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
                :style=`{}`
                ).row.full-width.items-start.content-start.q-mb-xs
                //- left: select
                div(
                  v-if="composition.layers.length > 1 ? !storeEditor.layerEditing : false"
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
                    :composition="composition" :layer="l" :layerIndex="li")
                //- right: drag
                div(
                  v-if="composition.layers.length > 1 ? !storeEditor.layerEditing : false"
                  :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                  q-btn(
                    round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
                    kalpa-menu-popup(:actions="layerActions" :value="l")
            //- layer ADD
            div(
              v-show="true"
              :style=`{}`).row.full-width.justify-center
              div(:style=`{maxWidth: '680px', paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
                q-btn(
                  @click="layerAdd()"
                  flat color="green" icon-right="add" no-caps
                  :style=`{height: '40px'}`
                  ).full-width
                  span.text-bold.q-mx-sm {{$t('layer_add', 'Добавить фрагмент')}}
  //- footer: layersSelected
  div(
    v-if="layersSelected.length > 0"
    :style=`{
      position: 'absolute', bottom: 0, zIndex: 1000,
      borderRadius: '10px', overflow: 'hidden',
      paddingLeft: '40px', paddingRight: '40px',
    }`).row.full-width.justify-center.q-py-sm.b-70
    q-btn(flat dense color="white" no-caps @click="layersSelected = []") {{$t('cancel', 'Отмена')}}
    q-btn(flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm {{$t('layer_editor_layers_delete', 'Удалить фрагменты')}}
    .col
    //- layer-mover(:composition="composition" :layersSelected="layersSelected")
    //- q-btn(flat dense color="green" no-caps @click="")
  //- footer: progress, actions: delete,create_node
  .row.full-width.justify-center
    div(
      v-if="layersSelected.length === 0"
      :style=`{
        maxWidth: '680px',
        paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
      //- v-show="composition.layers.length > 1 ? !storeEditor.layerEditing : false"
      composition-progress(
        v-if="composition.layers.length > 0"
        v-show="!storeEditor.layerEditing"
        :composition="composition" :storeEditor="storeEditor" :storePlayer="storePlayer")
      //- actions
      //- v-show="composition.layers.length > 1 ? !storeEditor.layerEditing : true"
      div().row.full-width.items-center.content-center.q-py-xs
        q-btn(round flat dense color="red" icon="delete_outline" :style=`{opacity: 0.7}` @click="$emit('delete')")
        .col
        node-creator(:composition="composition")
        .col
        q-btn(round flat dense color="green" icon="check" @click="$emit('close')")
</template>

<script>
import draggable from 'vuedraggable'

import nameEditor from './name_editor'
import layerEditor from './layer_editor'
import layerMover from './layer_mover'
import compositionProgress from '../composition_progress'
import nodeCreator from './node_creator'

export default {
  name: 'pageEdit',
  components: {draggable, nameEditor, layerEditor, layerMover, compositionProgress, nodeCreator},
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
    },
    layersDuration () {
      return this.composition.layers.reduce((acc, layer) => {
        let layerDuration = layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t
        acc += layerDuration
        return acc
      }, 0)
    },
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
      if (!confirm(this.$t('layer_delete', 'Удалить слой?'))) return
      // unset in storeEditor
      this.layerDrop()
      // delete from composition
      let i = this.composition.layers.findIndex(l => l.id === layer.id)
      this.$log('i', i)
      if (i >= 0) this.$delete(this.composition.layers, i)
      this.layerDeleteAfter()
    },
    layerDeleteAfter () {
      this.$log('layerDeleteAfter')
      if (this.composition.layers.length === 1) {
        alert('layerDeleteAfter')
        this.layerEdit({id: this.composition.layers[0].id})
      }
    },
    layerDrop () {
      this.$log('layerDrop')
      this.storeEditor.layerPlaying = null
      this.storeEditor.layerEditing = null
    },
    layerAdd () {
      this.$log('layerAdd')
      this.layerDrop()
      let id = this.storeEditor.layerAdd()
      this.storeEditor.layerPlaying = id
      // this.layerEdit({id})
    },
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      if (!confirm(this.$t('layers_delete', 'Удалить выбранные слои?'))) this.layerSelected = []
      this.layersSelected.map(id => {
        // drop playing/editing layer
        if (this.storeEditor.layerPlaying === id || this.storeEditor.layerEditing === id) this.layerDrop()
        // delete layer one by one...
        let i = this.composition.layers.findIndex(l => l.id === id)
        if (i >= 0) this.$delete(this.composition.layers, i)
      })
      this.layerDeleteAfter()
      this.layersSelected = []
    },
    // move to layer mover
    layersSelectedMove () {
      this.$log('layersSelectedMove')
      // find the composition layers to move to?
      this.layersSelectedMoveOpened = true
      this.layersSelected = []
    },
    layersSelectedMoveDone () {},
  },
  mounted () {
    this.$log('mounted')
    if (this.composition.layers.length === 1) {
      this.layerEdit(this.composition.layers[0])
    }
  },
}
</script>
