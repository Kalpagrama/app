<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- mode EMPTY
  div(v-if="mode === 'empty'").row.fit.items-between.content-between.justify-center.q-py-md
    q-btn(
      @click="layerFirstAdd()"
      flat color="green" icon="add" no-caps
      ) {{$t('wsCompositionEditor_Add first fragment!', 'Добавить первый фрагмент!')}}
    .row.full-width.justify-center
      q-btn(
        @click="$emit('close')"
        flat color="white" icon="clear" no-caps
        :style=`{}`
        )
        .row.full-width.justify-center
          span.text-white {{ $t('wsCompositionEditor_Cancel firsty', 'Отмена') }}
  //- mode MINI
  div(v-if="mode === 'mini'").column.fit
    //- header
    .row.full-width.justify-center
      name-editor(
        :composition="composition"
        :style=`{maxWidth: '600px'}`)
    //- body
    .col.full-width
      div(v-if="storePlayer").row.full-width.justify-center
        layer-editor(
          @delete="layerDelete(l)"
          @createNode="layersSelectedCreateNode([l.id])"
          :composition="composition" :layer="composition.layers[0]" :layerIndex="0"
          :style=`{
            maxWidth: '600px',
          }`)
    //- footer
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px',}`).row.full-width.items-center.content-center.q-pa-sm
        q-btn(flat dense color="white" no-caps icon="content_cut" @click="modeMiniToMaxi()")
          span(v-if="$q.screen.width > 400").text-white.text-bold.q-mx-sm {{$t('pageEdit_montage', 'Монтаж')}}
        .col
        q-btn(flat dense color="grey-5" no-caps @click="$emit('close')").q-px-sm.q-mr-sm {{$t('pageEdit_cancel', 'Отмена')}}
        q-btn(dense color="green" icon-right="check" no-caps @click="$emit('close')")
          span.text-bold.text-white.q-mx-xs {{$t('pageEdit_save', 'Сохранить')}}
  //- mode MAXI
  div(v-if="mode === 'maxi'" :style=`{position: 'relative',}`).column.fit
    //- layer
    //- div(v-if="")
    //- header
    div(v-show="!storeEditor.layerEditing").row.full-width.justify-center
      name-editor(
        :composition="composition"
        :style=`{maxWidth: '600px'}`)
    //- layers list
    div(v-if="storePlayer").col.full-width
      div(:style=`{position: 'relative'}`).column.fit
        //- body: layers, dragging
        .col.full-width.scroll
          .row.full-width.justify-center
            div(
              :class=`{
              }`
              :style=`{maxWidth: '600px',}`).row.full-width.justify-center
              draggable(
                :list="composition.layers" group="layers" :sort="true" handle=".layer-drag-handle"
                @start="layersDragging = true"
                @end="layersDragging = false").full-width
                div(
                  v-for="(l,li) in composition.layers" :key="l.id"
                  v-if="storeEditor.layerEditing ? storeEditor.layerEditing === l.id : true"
                  :style=`{}`
                  ).row.full-width.items-start.content-start.q-mb-xs
                  //- left: select
                  div(
                    v-show="!storeEditor.layerEditing"
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
                    v-show="!storeEditor.layerEditing"
                    :style=`{width: '40px', height: '40px'}`).row.items-center.content-center.justify-center
                    q-btn(
                      round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
                      kalpa-menu-popup(:actions="layerActions" :value="l")
              //- layer ADD/SAVE
              div(
                :style=`{}`).row.full-width.justify-center
                div(:style=`{maxWidth: '600px', paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
                  q-btn(
                    v-show="!storeEditor.layerEditing"
                    @click="layerAdd()"
                    flat color="green" icon-right="add" no-caps
                    :style=`{height: '40px'}`
                    ).full-width
                    span.text-bold.q-mx-sm {{$t('layer_add', 'Добавить фрагмент')}}
                  q-btn(
                    v-show="storeEditor.layerEditing"
                    @click="storeEditor.layerEditing = null, storeEditor.layerPlaying = null"
                    flat color="green" icon-right="check" no-caps
                    :style=`{height: '40px'}`
                    ).full-width
                    span.text-bold.q-mx-sm {{$t('wsCompositionEditor_layerSaves', 'Сохранить фрагмент')}}
    //- footer: layersSelected
    div(
      v-if="layersSelected.length > 0"
      v-show="!storeEditor.layerEditing"
      :style=`{
        position: 'absolute', bottom: 0, zIndex: 1000,
        borderRadius: '10px', overflow: 'hidden',
        paddingLeft: '40px', paddingRight: '40px',
      }`).row.full-width.justify-center.q-py-sm.b-70
      q-btn(flat dense color="white" no-caps @click="layersSelected = []") {{$t('cancel', 'Отмена')}}
      q-btn(flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm {{$t('layer_editor_layers_delete', 'Удалить фрагменты')}}
      .col
      //- layer-mover(:composition="composition" :layersSelected="layersSelected")
    //- footer
    .row.full-width.justify-center
      div(
        v-show="layersSelected.length === 0"
        :style=`{
          maxWidth: '600px',
        }`).row.full-width
        //- v-show="!storeEditor.layerEditing"
        composition-progress(
          v-if="composition.layers.length > 0"
          v-show="!storeEditor.layerEditing"
          :options="options"
          :composition="composition" :storeEditor="storeEditor" :storePlayer="storePlayer")
        //- actions
        //- v-show="!storeEditor.layerEditing"
        div(
          v-show="!storeEditor.layerEditing"
          ).row.full-width.items-center.content-center.q-pa-xs
          q-btn(
            v-if="composition.layers.length === 1"
            flat dense color="white" no-caps icon="content_cut" @click="modeMaxiToMini()")
            span.text-white.text-bold.q-mx-sm {{$t('pageEdit_maxiToMini', 'К мини-версии')}}
          .col
          q-btn(flat dense color="grey-5" no-caps @click="$emit('close')").q-px-sm.q-mr-sm {{$t('pageEdit_cancel', 'Отмена')}}
          q-btn(dense color="green" icon-right="check" no-caps @click="$emit('close')")
            span.text-bold.text-white.q-mx-xs {{$t('pageEdit_save', 'Сохранить')}}
</template>

<script>
import draggable from 'vuedraggable'

import nameEditor from './name_editor'
import layerEditor from './layer_editor'
import layerMover from './layer_mover'
import compositionProgress from '../composition_progress'

export default {
  name: 'pageEdit',
  components: {draggable, nameEditor, layerEditor, layerMover, compositionProgress},
  props: ['composition', 'options'],
  inject: ['sidPlayer', 'sidEditor'],
  data () {
    return {
      mode: 'mini', // empty, mini, maxi
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
  watch: {
    composition: {
      immediate: true,
      handler (to, from) {
        if (to.layers.length === 0) this.mode = 'empty'
      }
    }
  },
  methods: {
    modeMiniToMaxi () {
      this.$log('modeMiniToMaxi')
      this.mode = 'maxi'
      this.storeEditor.layerEditing = null
      this.storeEditor.layerPlaying = null
    },
    modeMaxiToMini () {
      this.$log('modeMaxiToMini')
      if (this.composition.layers.length === 1) {
        this.mode = 'mini'
        this.storeEditor.layerEditing = this.composition.layers[0].id
      }
      else {
        this.$q.notify('Mini mode is possible with only with 1 fragment!')
      }
    },
    layerFirstAdd () {
      this.$log('layerFirstAdd')
      this.layerAdd()
      this.mode = 'mini'
    },
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
      // if (this.composition.layers.length === 1) {
      //   // alert('layerDeleteAfter')
      //   this.layerEdit({id: this.composition.layers[0].id})
      // }
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
      this.storeEditor.layerEditing = id
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
      this.mode = 'mini'
      this.layerEdit(this.composition.layers[0])
    }
    else if (this.composition.layers.length > 1) {
      this.mode = 'maxi'
    }
  },
}
</script>
