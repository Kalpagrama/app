<template lang="pug">
div(:style=`{position: 'relative',}`).row.full-width
  //- one layer composition ONLY, for now...
  div(
    v-if="composition.layers.length === 1"
    :style=`{}`
    ).row.full-width
    layer-frames(
      :player="player"
      :layer="composition.layers[0]"
      :layerStart="composition.layers[0].figuresAbsolute[0].t"
      :layerEnd="composition.layers[0].figuresAbsolute[1].t"
      :layerDuration="composition.layers[0].figuresAbsolute[1].t-composition.layers[0].figuresAbsolute[0].t")
      template(v-slot:meta=`{panning}`)
        composition-bar(
          :isActive="panning"
          :player="player" :composition="composition" :contentKalpa="contentKalpa"
          actionsPosition="bottom"
          :style=`{position: 'absolute', top: '0px', zIndex: 99999}`
          :barStyles=`{
            height: '100%',
            //- opacity: 0.1
          }`).fit
</template>

<script>
import compositionBar from 'components/composition/composition_bar/index.vue'
import layerFrames from './layer_frames.vue'

export default {
  name: 'compositionEditor_video',
  components: {compositionBar, layerFrames},
  props: ['composition', 'player', 'contentKalpa'],
  data () {
    return {
      layerSelectedId: null,
      layerEditingId: null,
      layersChecked: []
    }
  },
  watch: {
    composition: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('composition TO', to)
          let figures = this.composition.layers[0].figuresAbsolute
          this.player.stateSet('figures', [figures])
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.composition.layers.length === 1) {
      this.layerEditingId = this.composition.layers[0].id
    }
  },
  // beforeDestroy () {
  //   this.player.stateSet('figures', [])
  // }
}
</script>
