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
  layer-header(:mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
  layer-frames(:mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
  layer-actions(:mode="mode" v-bind="$props" @mode="mode = $event" @meta="$emit('meta', $event)")
</template>

<script>
import layerHeader from './layer_header'
import layerFrames from './layer_frames'
import layerActions from './layer_actions'

export default {
  name: 'extraLayers-layerItem',
  components: {layerHeader, layerFrames, layerActions},
  props: ['player', 'meta', 'layer', 'layerIndex', 'layerIsFirst', 'layerIsLast', 'layersView', 'width'],
  data () {
    return {
      mode: 'norm',
      height: 44
    }
  },
  computed: {
    modes () {
      return {
        norm: {
          fn: () => {
            this.$tween.to(this, 0.5, {height: 44})
            this.$emit('meta', ['mode', 'watch'])
            this.$emit('meta', ['layerIndexPlay', -1])
          }
        },
        edit: {
          fn: () => {
            this.$tween.to(this, 0.5, {height: 200})
            this.$emit('meta', ['mode', 'layer'])
            this.$emit('meta', ['layerIndexPlay', this.layerIndex])
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
    'meta.layerIndexPlay': {
      immediate: true,
      async handler (to, from) {
        // this.$log('meta.layerIndexPlay CHANGED', to)
        if (to < 0) return
        if (to === this.layerIndex) {
          this.mode = 'edit'
        }
        else {
          await this.$wait(600)
          // this.height = 44
          this.mode = 'norm'
        }
      }
    }
    // layersView: {
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('layersView', to)
    //     switch (to) {
    //       case 'line': {
    //         this.$tween.to(this, 0.5, {height: this.heightMin})
    //         break
    //       }
    //       case 'normal': {
    //         if (this.height === this.heightMin) {
    //           this.$tween.to(this, 0.5, {height: this.heightNormal})
    //         }
    //         this.framesDragToLayer()
    //         break
    //       }
    //     }
    //   }
    // }
  }
}
</script>
