<template lang="pug">
div(
  :class=`{
    'b-90': height < 100,
    'b-100': height > 50
  }`
  :style=`{
    position: 'relative',
    height: height+'px',
    borderBottom: layerIsLast ? 'none' : '1px solid rgb(50,50,50)',
    borderRadius: layersView === 'line' ? '0px' : '10px',
    overflow: 'hidden'
  }`
  ).row.full-width.items-start.content-start
  layer-header(:view="view" v-bind="$props")
  layer-frames(:view="view" v-bind="$props")
  layer-actions(:view="view" v-bind="$props")
</template>

<script>
import layerHeader from './layer_header'
import layerFrames from './layer_frames'
import layerActions from './layer_actions'
import layerNameEditor from './layer_name_editor'

export default {
  name: 'extraLayers-layerItem',
  components: {layerHeader, layerFrames, layerActions, layerNameEditor},
  props: ['player', 'meta', 'layer', 'layerIndex', 'layerIsFirst', 'layerIsLast', 'layersView', 'width'],
  data () {
    return {
      view: 'mini',
      height: 44,
      heightMin: 26,
      heightNormal: 44,
      heightMax: 190
    }
  },
  watch: {
    view: {
      handler (to, from) {
        this.$log('view CHANGED', to)
      }
    },
    layersView: {
      immediate: true,
      handler (to, from) {
        this.$log('layersView', to)
        switch (to) {
          case 'line': {
            this.$tween.to(this, 0.5, {height: this.heightMin})
            break
          }
          case 'normal': {
            if (this.height === this.heightMin) {
              this.$tween.to(this, 0.5, {height: this.heightNormal})
            }
            this.framesDragToLayer()
            break
          }
        }
      }
    }
  }
}
</script>
