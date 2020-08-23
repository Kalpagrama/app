<template lang="pug">
div(:style=`{position: 'relative',marginTop: '-10px',paddingTop: '10px',}`).row.full-width.items-start.content-start.b-60
  layer-frames(:player="player" :layer="layer" :layerStart="layerStart" :layerEnd="layerEnd" :layerDuration="layerDuration")
  layer-bar(:player="player" :layer="layer" :layerStart="layerStart" :layerEnd="layerEnd" :layerDuration="layerDuration")
  //- actions
  div(:style=`{paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.q-py-xs
    q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(0)").q-mr-xs.rotate-180
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(0,0)")
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(0,1)")
    .col
    q-btn(round flat dense color="green" icon="add" @click="$emit('layerAdd')")
    .col
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_left" @click="layerForward(1,0)")
    q-btn(round flat dense color="grey-6" icon="keyboard_arrow_right" @click="layerForward(1,1)")
    q-btn(round flat dense color="grey-6" icon="flip" @click="layerSet(1)")
</template>

<script>
import layerFrames from './layer_frames.vue'
import layerBar from './layer_bar.vue'

export default {
  name: 'layerEditor',
  components: {layerFrames, layerBar},
  props: ['layer', 'player'],
  data () {
    return {
    }
  },
  computed: {
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    layerDuration () {
      return this.layerEnd - this.layerStart
    }
  },
  metods: {
    layerSet () {
      this.$log('layerSet')
    },
    layerForward () {
      this.$log('layerForward')
    }
  }
}
</script>
