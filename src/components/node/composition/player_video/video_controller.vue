<script>
export default {
  name: 'videoController',
  props: ['ctx', 'composition', 'player', 'meta'],
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
    'meta.layerId': {
      handler (to, from) {
        this.$log('meta.layerId CHANGED', to)
        if (to) {
          this.player.setCurrentTime(this.meta.layerStart)
          this.player.play()
        }
      }
    },
    'meta.mode': {
      handler (to, from) {
        this.$log('meta.mode CHANGED', to)
        if (to === 'layer') {
          // do noting?
        }
        else if (to === 'composition') {
          // set first layer? if from !== composition?
          // this.meta.layerId = this.composition.layers[0].id
          this.player.meta(['layerId', this.composition.layers[0].id])
          // this.player.play()
        }
        else if (to === 'content') {
          // do nothing?
        }
      }
    },
    'meta.now': {
      handler (to, from) {
        // if (this.timeupdateStop) return
        // LAYER
        if (this.meta.mode === 'layer') {
          if (to >= this.meta.layerEnd) {
            this.player.setCurrentTime(this.meta.layerStart)
          }
          if (to <= this.meta.layerStart) {
            this.player.setCurrentTime(this.meta.layerStart)
          }
        }
        // COMPOSITION
        else if (this.meta.mode === 'composition') {
          // if (to >= this.meta.layerEnd) {
          //   // find next layer or go to first one
          //   let layerIndex = this.meta.layers.findIndex(layer => layer.id === this.meta.layerId)
          //   let layerIndexNext = layerIndex + 1
          //   if (this.meta.layers[layerIndexNext]) {
          //     // this.meta.layerId = this.layers[layerIndexNext].id
          //     this.player.meta(['layerId', this.meta.layers[layerIndexNext].id])
          //   }
          //   else {
          //     this.player.meta(['layerId', this.meta.layers[0].id])
          //     // this.meta.layerId = this.layers[0].id
          //   }
          // }
          // if (to <= this.meta.layerStart) {
          //   this.player.setCurrentTime(this.meta.layerStart)
          // }
        }
        // CONTENT
        else if (this.meta.mode === 'content') {
          // do nothing?
        }
      }
    }
  },
  methods: {}
}
</script>
