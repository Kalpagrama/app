<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden'
  }`
  ).column.fit
  .col.full-width
    component(
      :is="'layer-'+tabId"
      :stateExplorer="stateExplorer" :stateLayerEditor="stateLayerEditor"
      :style=`{}`
      )
  layer-tools(
    :stateExplorer="stateExplorer" :stateLayerEditor="stateLayerEditor"
    :style=`{
      order: 1
    }`)
</template>

<script>
import layerName from './layer_name'
import layerBorders from './layer_borders'
import layerSpheres from './layer_spheres'
import layerTools from './layer_tools'

export default {
  name: 'layerEditor',
  components: {layerName, layerBorders, layerSpheres, layerTools},
  props: ['stateExplorer'],
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
    stateLayerEditor () {
      return {
        tabId: this.tabId,
        tabs: this.tabs,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  }
}
</script>
