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
      template(v-slot:meta=`{panning}`)
        composition-bar(
          :isActive="panning"
          :player="player" :composition="composition" :contentKalpa="contentKalpa"
          actionsPosition="bottom"
          :style=`{position: 'absolute', top: '0px', zIndex: 99999}`)
    //- .row.full-width
      span.text-white {{ composition.layers[0].figuresAbsolute[1].t-composition.layers[0].figuresAbsolute[0].t }}
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
