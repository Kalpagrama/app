<template lang="pug">
.row.full-width
  //- one layer composition
  div(
    v-if="composition.layers.length === 1"
    :style=`{}`
    ).row.full-width
    layer-frames(
      :player="player"
      :layer="composition.layers[0]"
      :layerStart="composition.layers[0].figuresAbsolute[0].t"
      :layerEnd="composition.layers[0].figuresAbsolute[1].t"
      :layerDuration="composition.layers[0].figuresAbsolute[1].t-composition.layers[0].figuresAbsolute[0].t"
      )
      template(v-slot:meta)
        composition-bar(
          :player="player" :composition="composition" :contentKalpa="contentKalpa"
          actionsPosition="top"
          :style=`{position: 'absolute', top: '-34px', zIndex: 99999}`)
    //- .row.full-width
      span.text-white {{ composition.layers[0].figuresAbsolute[1].t-composition.layers[0].figuresAbsolute[0].t }}
  //- multi layer composition
//- .row.full-width
  //- layers list or one layer?
  .row.full-width.items-start.content-start
    div(
      v-for="(l,li) in composition.layers" :key="l.id"
      ).row.full-width.items-center.content-center.justify-center.q-mb-xs
      q-checkbox(
        v-if="composition.layers.length > 1 && !layerEditingId"
        v-model="layersChecked" :val="l.id"
        flat dense dark color="green"
        :style=`{opacity: layersChecked.includes(l.id) ? 1 : 0.3}`).q-ma-sm
      div(:style=`{maxWidth: '100%',}`).col
        layer-figures(
          :layer="l" :layerIndex="li"
          :player="player" :composition="composition"
          :isSelected="layerSelectedId === l.id"
          :isEditing="layerEditingId === l.id"
          )
      q-btn(
        v-if="composition.layers.length > 1 && !layerEditingId"
        @click="layerDelete(l,li)"
        round flat dense color="grey-6" icon="drag_indicator")
  //- composition bar
  div(v-if="true || composition.layers.length > 1").row.full-width.justify-center
    composition-bar(
      :composition="composition" :player="player" :contentKalpa="contentKalpa"
      actionsPosition=""
      :style=`{
        maxWidth: '600px',
      }`)
  //- actions
  //- .row.full-width.justify-center
    q-btn(flat dense no-caps color="green" icon="add" @click="layerAdd()").q-px-sm Add layer
  //- debug
  //- .row.full-width
    small.text-white layersChecked: {{ layersChecked }}
</template>

<script>
import layerFigures from './layer_figures/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'
import layerFrames from './layer_frames.vue'

export default {
  name: 'compositionEditor_video',
  components: {layerFigures, compositionBar, layerFrames},
  props: ['composition', 'player', 'contentKalpa'],
  data () {
    return {
      layerSelectedId: null,
      layerEditingId: null,
      layersChecked: []
    }
  },
  methods: {
    layerAdd (t) {
      this.$log('layerAdd', t)
      let start = t || this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let layerInput = {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]}
      this.$set(this.composition.layers, this.composition.layers.length, layerInput)
      this.player.setCurrentTime(start)
    },
    layerDelete (l, li) {
      this.$log('layerDelete', l, li)
      this.$delete(this.composition.layers, li)
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.composition.layers.length === 1) {
      this.layerEditingId = this.composition.layers[0].id
    }
  }
}
</script>
