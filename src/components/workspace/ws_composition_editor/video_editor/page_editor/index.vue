<template lang="pug">
div(
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px'
  }`
  ).column.fit.b-50
  //- span.text-white {{ stateEditor }}
  //- content progress with layers on it
  //- div(
  //-   v-if="true"
  //-   :style=`{position: 'absolute', zIndex: 9999, top: '-62px', left: 0}`).row.full-width.justify-center
  //-   ws-content-video-progress(
  //-     :stateEditor="stateEditor"
  //-     :style=`{maxWidth: stateEditor.pageContentWidth-80+'px'}`)
  //-     template(v-slot:meta)
  //- div(:style=`{position: 'absolute', zIndex: 99999, top: '-62px', height: '60px',}`).row.full-width.bg
  //-       div(
  //-         :style=`{
  //-           position: 'absolute', zIndex: 200,
  //-           top: '0px',
  //-           pointerEvents: 'none',
  //-         }`).row.fit
  //-         div(
  //-           v-for="(l,li) in composition.layers" :key="li"
  //-           :style=`{
  //-             position: 'absolute', zIndex: 300+li,
  //-             left: (l.figuresAbsolute[0].t/stateEditor.statePlayer.duration)*100+'%',
  //-             width: ((l.figuresAbsolute[1].t-l.figuresAbsolute[0].t)/stateEditor.statePlayer.duration)*100+'%',
  //-             background: l.color,
  //-             opacity: 0.9,
  //-           }`
  //-           ).row.full-height
  //- tools selected
  div(
    v-if="layersSelected.length > 0"
    :style=`{position: 'absolute', zIndex: 1000, left: 0, top: '24px',}`
    ).row.full-width.justify-center
    div(:style=`{maxWidth: stateEditor.pageContentWidth-80+'px',}`).row.full-width.items-center.content-center.q-pa-xs
      q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []").q-mr-xs
      q-btn(
        v-if="false"
        round dense color="green" no-caps @click="layersSelectedCreateNode()").q-px-sm Create node
      q-btn(round flat dense color="white" no-caps @click="layersSelectedMove()").q-px-sm Move
      q-btn(
        v-if="composition.layers.length > 1"
        round flat dense color="red" no-caps @click="layersSelectedDelete()").q-px-sm Delete
  //- body
  div(v-if="true").col.full-width.scroll
    div(
      :style=`{paddingBottom: '300px'}`
      ).row.full-width.items-start.content-start
      div(:style=`{paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.q-py-xs
        q-btn(round flat dense color="grey-6" icon="search")
        .col
        q-btn(round flat dense color="grey-6" icon="sort")
      draggable(
        :list="composition.layers" group="layers" handle=".layer-drag-handle"
        :sort="true"
        @start="layersDragging = true"
        @end="layersDragging = false").full-width
        div(
          v-for="(l,li) in composition.layers" :key="li"
          :style=`{
            borderRadius: $store.state.ui.borderRadius+'px',
            overflow: 'hidden',
          }`
          ).row.full-width.items-start.content-start.q-mb-xs
          //- left
          div(
            :style=`{width: '40px', height: '40px'}`
            ).row.items-center.content-center.justify-center
            q-checkbox(
              v-model="layersSelected" :val="l.id" dark dense color="grey-6"
              :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
          //- middle
          .col
            layer-editor(
              :layer="l"
              :stateEditor="stateEditor")
          //- right
          div(
            :style=`{width: '40px', height: '40px'}`
            ).row.items-center.content-center.justify-center
            q-btn(round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
              kalpa-menu-popup(:actions="layerActions" :value="l")
      //- layer add
      div(
        :style=`{
          height: '40px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }`).row.full-width
        .row.fit
          q-btn(round flat color="green" icon="add" @click="layerAdd()").fit.b-60
            q-tooltip(anchor="top middle" self="center middle") Add layer at: {{ $time(stateEditor.currentTime) }}
  //- progress
  div(
    v-if="stateEditor"
    :style=`{
      position: 'relative',
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`).row.full-width.b-60.br
    composition-progress(
      ref="compositionProgress"
      :composition="composition"
      :stateEditor="stateEditor"
      :statePlayer="statePlayer").fit
  //- footer stats
  div(
    v-if="true"
    :style=`{
    }`
    ).row.full-width.items-center.content-center.q-py-xs
    .col
    small.text-grey-6.q-mr-sm [layers: {{ composition.layers.length }},
    small(
      :class=`{
        'text-grey-6': compositionDuration <= 60,
        'text-red': compositionDuration > 60
      }`
      :style=`{}`
      ).q-mr-sm duration: {{ $time(compositionDuration) }}]
  //- composition name
  div(
    v-if="true"
    :style=`{}`).row.full-width
    q-input(
      v-model="composition.name"
      filled dark color="grey-5"
      label="Composition name"
      autogrow
      autofocus
      :input-style=`{
        fontSize: '16px',
      }`
      :style=`{
        transform: 'translate3d(0,0,0)',
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
        fontSize: '18px',
      }`
      ).full-width.b-50
  //- footer
  div(
    v-if="true"
    :style=`{
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-sm.br
    q-btn(round flat dense color="red" icon="delete_outline" @click="$emit('delete')"
      :style=`{opacity: .6}`)
    .col
    q-btn(
      v-if="false"
      @click="$emit('createNode')"
      dense color="green" no-caps).q-px-sm Create node
    .col
    q-btn(round flat dense color="green" icon="check" @click="$emit('close')")
</template>

<script>
import draggable from 'vuedraggable'

import compositionProgress from '../composition_progress'
import layerEditor from '../layer_editor'

export default {
  name: 'videoEditor-pageEditor',
  components: {draggable, layerEditor, compositionProgress},
  props: ['stateEditor', 'statePlayer', 'composition', 'options'],
  // inject: ['stateEditor'],
  data () {
    return {
      searchString: '',
      layersSelected: [],
      layersDragging: false,
      layerSelected: null,
      layerEditing: null,
      compositionPlaying: false
    }
  },
  computed: {
    // composition () {
    //   return this.stateEditor.composition
    // },
    compositionDuration () {
      return this.composition.layers.reduce((acc, val) => {
        acc += (val.figuresAbsolute[1].t - val.figuresAbsolute[0].t)
        return acc
      }, 0)
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
    layerClick (l, li) {
      this.$log('layerClick', l, li)
    },
    layerAdd () {
      this.$log('layerAdd')
      let layerIndex = this.composition.layers.length
      let layerId = Date.now().toString()
      let layerColor = this.$randomColor(layerId)
      let layerStart = this.stateEditor.currentTime
      let layerEnd = layerStart + 10 > this.stateEditor.duration ? this.stateEditor.duration : layerStart + 10
      if (layerEnd > this.stateEditor.duration) alert('layerEnd > this.stateEditor.duration')
      let layerInput = {
        id: layerId,
        color: layerColor,
        contentOid: this.stateEditor.content.oid,
        figuresAbsolute: [
          {t: layerStart, points: []},
          {t: layerEnd, points: []},
        ],
        figuresRelative: [],
        spheres: []
      }
      this.$set(this.composition.layers, layerIndex, layerInput)
      return layerId
    },
    layerEdit (l) {
      this.$log('layerEdit', l)
      // open layer editor...
    },
    layerCopy (l) {
      this.$log('layerCopy', l)
      // paste to the next position...
    },
    layerDelete (l, confirmed) {
      this.$log('layerDelete', l)
      if (this.composition.layers.length === 1) return
      if (!confirmed && !confirm('Delete layer ?')) return
      let i = this.composition.layers.findIndex(layer => layer.id === l.id)
      this.$log('i', i)
      if (i >= 0) this.$delete(this.composition.layers, i)
    },
    layersSelectedCreateNode () {
      this.$log('layersSelectedCreateNode')
      this.layersSelected = []
    },
    layersSelectedMove () {
      this.$log('layersSelectedMove')
      this.layersSelected = []
    },
    layersSelectedDelete () {
      this.$log('layersSelectedDelete')
      if (this.composition.layers.length === 1) return
      if (!confirm('Delete selected ?')) return
      this.layersSelected.map(l => {
        this.layerDelete({id: l}, true)
      })
      this.layersSelected = []
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
