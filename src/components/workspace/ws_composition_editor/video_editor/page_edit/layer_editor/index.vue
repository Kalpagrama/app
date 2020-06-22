<template lang="pug">
div(
  :class=`{
    'b-60': true,
  }`
  :style=`{borderRadius: '10px'}`).row.full-width
  layer-frames(:storePlayer="storePlayer" :stateLayerEditor="stateLayerEditor" :layer="layer")
  //- name editor
  div(:style=`{}`).row.full-width.justify-center
    q-input(
      :value="layerName" @input="layerNameChanged"
      filled dense dark color="white"
      :style=`{maxWidth: '600px'}`).full-width
      template(v-slot:prepend)
        small(:style=`{fontSize: '12px'}`).text-grey-5 {{ $time(layer.figuresAbsolute[0].t) }}
      template(v-slot:append)
        small(:style=`{fontSize: '12px'}`).text-grey-5 {{ $time(layer.figuresAbsolute[1].t) }}
</template>

<script>
import layerFrames from './layer_frames'

export default {
  name: 'layerEditor',
  components: {layerFrames},
  props: ['selected', 'layer'],
  inject: ['sidPlayer'],
  data () {
    return {
    }
  },
  computed: {
    storePlayer () {
      return this.$stores[this.sidPlayer]
    },
    layerName () {
      if (this.layer.spheres.length > 0) return this.layer.spheres[0].name
      else return ''
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    },
    stateLayerEditor () {
      return {
        layerStart: this.layerStart,
        layerEnd: this.layerEnd
      }
    }
  },
  methods: {
    layerNameChanged (e) {
      this.$log('layerNameChanged', e)
      this.$set(this.layer.spheres, 0, {name: e})
    }
  },
  mounted () {
    this.$log('mounted')
    // this.$watch('storePlayer.state.currentTime', (from, to) => {
    //   this.$log('storePlayer.state.currentTime TO', to)
    //   if (to > this.layerEnd || to < this.layerStart) {
    //     this.storePlayer.commit('setCurrentTime', this.layerStart)
    //   }
    // })
  }
}
</script>
