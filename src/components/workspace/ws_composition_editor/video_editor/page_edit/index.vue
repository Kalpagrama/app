<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header: composition.name, check:close
  .row.full-width.justify-center
    name-editor(
      :composition="composition" @close="$emit('close')"
      :style=`{maxWidth: '600px'}`)
  //- layers list
  div(v-if="storePlayer").col.full-width
    div(:style=`{position: 'relative'}`).column.fit
      //- header: actions, layersSelected
      div(
        v-if="!storeEditor.layerEditing"
        :style=`{paddingLeft: '40px', paddingRight: '40px',}`).row.full-width.justify-center
        div(:style=`{position: 'relative', maxWidth: '600px'}`).row.full-width.items-center.content-center.q-py-xs
          q-btn(round flat dense color="grey-4" icon="search")
          .col
          q-btn(round flat dense color="grey-4" icon="sort")
          //- header: layersSelected
          div(
            v-if="layersSelected.length > 0"
            :style=`{
              position: 'absolute', zIndex: 1000,
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.justify-center.b-60
            q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []")
            q-btn(flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm {{$t('delete', 'Удалить')}}
            .col
            q-btn(dense color="white" flat no-caps @click="layersSelectedMove()") {{$t('move', 'Перенести')}}
            q-btn(dense color="green" no-caps @click="layersSelectedCreateNode()").q-px-sm {{$t('create_node', 'Собрать ядро')}}
      //- body: layers, dragging
      .col.full-width.scroll
        .row.full-width.justify-center
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
                    :layer="l" :layerIndex="li")
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
              div(:style=`{maxWidth: '680px', paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
                q-btn(
                  @click="layerAdd()"
                  flat color="green" icon-right="add" no-caps
                  :style=`{height: '40px'}`
                  ).full-width.b-70
                  span.text-bold.q-mx-sm {{$t('layer_add', 'Добавить фрагмент')}}
  //- footer: progress, actions: delete,create_node
  div(
    v-if="true"
    :style=`{paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
    composition-progress(
      v-if="composition.layers.length > 0"
      :composition="composition" :storeEditor="storeEditor" :storePlayer="storePlayer")
    //- actions
    div().row.full-width.items-center.content-center.q-py-xs
      q-btn(flat dense color="red" no-caps) {{$t('delete', 'Удалить')}}
      .col
      node-creator(:composition="composition")
</template>

<script>
import draggable from 'vuedraggable'

import nameEditor from './name_editor'
import layerEditor from './layer_editor'
import compositionProgress from '../composition_progress'
import nodeCreator from './node_creator'

export default {
  name: 'pageEdit',
  components: {draggable, nameEditor, layerEditor, compositionProgress, nodeCreator},
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
      this.layersSelected = []
    },
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      this.layersSelected = []
    },
    layersSelectedMove () {
      this.$log('layersSelectedMove')
      this.layersSelected = []
    },
  },
  mounted () {
    this.$log('mounted')
    if (this.composition.layers.length === 1) {
      // alert('layerEdit FIRST')
      this.layerEdit(this.composition.layers[0])
    }
  },
}
</script>
