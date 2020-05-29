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
  layer-header(:editorType="editorType" :mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
  layer-frames(:editorType="editorType" :mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
  layer-actions(:editorType="editorType" :mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
</template>

<script>
import layerHeader from './layer_header'
import layerFrames from './layer_frames'
import layerActions from './layer_actions'

export default {
  name: 'extraLayers-layerItem',
  components: {layerHeader, layerFrames, layerActions},
  props: ['editorType', 'player', 'meta', 'layer', 'layerIndex', 'layerIsFirst', 'layerIsLast', 'layersView', 'width'],
  data () {
    return {
      mode: 'norm',
      height: 50,
      heightMax: 290,
      heightMin: 50
    }
  },
  computed: {
    modes () {
      return {
        norm: {
          fn: async () => {
            await this.$wait(500)
            this.$tween.to(this, 0.5, {height: 50})
            if (!this.player) return
            this.player.meta(['mode', 'content'])
            // this.player.meta(['layerId', this.layer.id])
          }
        },
        edit: {
          fn: () => {
            this.$tween.to(this, 0.5, {height: 290})
            if (!this.player) return
            this.player.meta(['mode', 'layer'])
            this.player.meta(['layerId', this.layer.id])
          }
        },
      }
    }
  },
  watch: {
    mode: {
      immediate: true,
      handler (to, from) {
        this.$log('mode CHANGED', to)
        this.modes[to].fn()
      }
    },
    'meta.layerId': {
      handler (to, from) {
        this.$log('meta.layerId CHANGED', to)
        if (to) {
          if (to === this.layer.id) {
            this.mode = 'edit'
          }
          else {
            this.mode = 'norm'
          }
        }
      }
    }
  }
}
</script>
