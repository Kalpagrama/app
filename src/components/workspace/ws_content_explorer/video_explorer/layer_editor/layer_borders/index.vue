<template lang="pug">
.column.fit
  layer-frames(:stateExplorer="stateExplorer" :stateLayerEditor="stateLayerEditor")
  layer-actions(:stateExplorer="stateExplorer" :stateLayerEditor="stateLayerEditor")
</template>

<script>
import layerActions from './layer_actions'
import layerFrames from './layer_frames'

export default {
  name: 'layerBorders',
  props: ['stateExplorer', 'stateLayerEditor'],
  components: {layerActions, layerFrames},
  data () {
    return {
    }
  }
}
</script>
