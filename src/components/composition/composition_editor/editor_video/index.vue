<template lang="pug">
.row.full-width.q-pa-sm
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
      div(:style=`{maxWidth: '600px',}`).col
        layer-figures(
          :layer="l" :layerIndex="li"
          :player="player" :composition="composition"
          :isSelected="layerSelectedId === l.id"
          :isEditing="layerEditingId === l.id"
          )
      q-btn(
        v-if="composition.layers.length > 1 && !layerEditingId"
        round flat dense color="grey-6" icon="drag_indicator")
  //- composition bar
  div(v-if="composition.layers.length > 1").row.full-width.justify-center
    composition-bar(
      :composition="composition" :player="player" :contentKalpa="contentKalpa"
      :style=`{
        maxWidth: '600px',
      }`)
  //- debug
  .row.full-width
    small.text-white layersChecked: {{ layersChecked }}
</template>

<script>
import layerFigures from './layer_figures/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'compositionEditor_video',
  components: {layerFigures, compositionBar},
  props: ['composition', 'player', 'contentKalpa'],
  data () {
    return {
      layerSelectedId: null,
      layerEditingId: null,
      layersChecked: []
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
