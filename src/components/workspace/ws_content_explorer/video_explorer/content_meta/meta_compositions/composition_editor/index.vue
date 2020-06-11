<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).column.fit.b-50
  div(:style=`{order: 2}`).row.full-width
    q-input(
      v-model="composition.name"
      filled dark color="grey-5"
      autogrow
      autofocus
      :input-style=`{
        fontSize: '16px',
      }`
      :style=`{
        transform: 'translate3d(0,0,0)',
        borderRadius: '10px',
        overflow: 'hidden',
        fontSize: '18px',
      }`
      ).full-width.b-50
  div(v-if="false").row.full-width.q-pt-md.q-px-md
    span.text-white.text-bold Layers
  //- tools
  div(
    v-if="false && !islayersSelected.length === 0"
    :style=`{height: '50px'}`
    ).row.full-width.items-center.content-center
    .col.q-px-sm
      q-input(
        v-model="searchString"
        filled dark dense color='grey-6'
        label="Find layer"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            round flat dense color="white" icon="clear" @click="searchString = ''")
    q-btn(round flat dense color="white" icon="sort").q-mr-sm
  //- tools selected
  div(
    v-if="layersSelected.length > 0"
    :style=`{height: '50px'}`
    ).row.full-width.items-center.content-center.q-px-sm.bg
    q-btn(round flat dense color="white" icon="clear" @click="layersSelected = []")
  .col.full-width.scroll
    div(
      ).row.full-width.items-start.content-start.q-pa-sm
      draggable(
        :list="composition.layers" group="layers" handle=".layer-drag-handle"
        :sort="true"
        @start="layersDragging = true"
        @end="layersDragging = false").full-width
        div(
          v-for="(l,li) in composition.layers" :key="li"
          :style=`{
            borderRadius: '10px',
            overflow: 'hidden',
          }`
          ).row.full-width.items-start.content-start.q-mb-xs
          div(
            :style=`{width: '40px', height: '40px'}`
            ).row.items-center.content-center.justify-center
            q-checkbox(
              v-model="layersSelected" :val="l.id" dark dense color="grey-6"
              :style=`{opacity: layersSelected.includes(l.id) ? 1 : 0.6}`)
          div(
            @click="layerClick(l,li)"
            ).col
            //- div(
            //-   :style=`{
            //-     height: '40px',
            //-     borderRadius: '10px',
            //-     overflow: 'hidden',
            //-   }`
            //-   ).row.full-width.items-center.content-center.q-py-sm.q-px-md.b-70
            //-   small.text-white {{ $time(l.figuresAbsolute[0].t) }}
            //-   //- small.text-white {{ $time(l.figuresAbsolute[1].t) }}
            //-   .col
            //-   small.text-white {{ $time(l.figuresAbsolute[1].t - l.figuresAbsolute[0].t) }}
            layer-editor(
              @add="layerAdd()"
              :layer="l" :stateExplorer="stateExplorer")
          div(
            :style=`{width: '40px', height: '40px'}`
            ).row.items-center.content-center.justify-center
            q-btn(round flat dense color="grey-6" icon="drag_indicator").layer-drag-handle
      //- layer add
      div(
        :style=`{
          height: '40px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }`).row.full-width
        .row.fit
          q-btn(round flat color="green" icon="add" @click="layerAdd()").fit.b-60
  //- footer stats
  div(
    :style=`{
    }`
    ).row.full-width.items-center.content-center.q-py-xs
    q-btn(round flat dense color="white" icon="play_arrow")
    .col
    small.text-white.q-mr-sm duration: {{ $time(compositionTotalTime) }}
  //- footer
  div(
    :style=`{
      order: 30,
      borderRadius: '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-sm
    q-btn(round flat dense color="red" icon="delete_outline" @click="compositionDelete()"
      :style=`{opacity: .6}`)
    .col
    q-btn(round flat dense color="green" icon="check" @click="done()")
</template>

<script>
import draggable from 'vuedraggable'
import layerEditor from '../../../layer_editor'

export default {
  name: 'compostionEditor',
  components: {draggable, layerEditor},
  props: ['stateExplorer'],
  data () {
    return {
      searchString: '',
      layersSelected: [],
      layersDragging: false,
      layerSelected: null,
      layerEditing: null,
    }
  },
  computed: {
    composition () {
      return this.stateExplorer.composition
    },
    compositionTotalTime () {
      return this.composition.layers.reduce((acc, val) => {
        acc += (val.figuresAbsolute[1].t - val.figuresAbsolute[0].t)
        return acc
      }, 0)
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
      let layerStart = this.stateExplorer.currentTime
      let layerEnd = layerStart + 10 > this.stateExplorer.duration ? this.stateExplorer.duration : layerStart + 10
      let layerInput = {
        id: layerId,
        color: layerColor,
        contentOid: this.stateExplorer.content.oid,
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
    done () {
      this.$log('done')
      // this.stateExplorer.set('composition', null)
      this.stateExplorer.set('compositionEditing', null)
    },
    compositionDelete () {
      this.$log('compositionDelete')
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
