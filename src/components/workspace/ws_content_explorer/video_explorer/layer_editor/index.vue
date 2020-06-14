<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).row.full-width
  layer-name(
    @add="$emit('add')"
    :stateExplorer="stateExplorer"
    :stateLayerEditor="stateLayerEditor")
</template>

<script>
import layerName from './layer_name'
import layerBorders from './layer_borders'
import layerSpheres from './layer_spheres'
import layerTools from './layer_tools'

export default {
  name: 'layerEditor',
  components: {layerName, layerBorders, layerSpheres, layerTools},
  props: ['stateExplorer', 'layer'],
  data () {
    return {
      tabId: 'name',
      tabs: [
        {id: 'name', name: 'Name'},
        {id: 'borders', name: 'Borders'},
        {id: 'spheres', name: 'Spheres'},
      ]
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
    },
    stateLayerEditor () {
      return {
        layer: this.layer,
        layerStart: this.layerStart,
        layerEnd: this.layerEnd,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  }
}
</script>
