<script>
export default {
  name: 'videoController',
  props: ['ctx', 'visible', 'active', 'mini', 'player', 'statePlayer'],
  data () {
    return {
    }
  },
  computed: {
  },
  watch: {
    active: {
      handler (to, from) {
        this.$log('active CHANGED', to)
        if (to) {
          this.player.play()
        }
      }
    },
    'statePlayer.layerId': {
      handler (to, from) {
        this.$log('statePlayer.layerId CHANGED', to)
        if (to !== undefined) {
          this.player.setCurrentTime(this.statePlayer.layerStart)
          this.player.play()
        }
      }
    },
    'statePlayer.mode': {
      handler (to, from) {
        this.$log('statePlayer.mode CHANGED', to)
        if (to === 'layer') {
          // do noting?
        }
        else if (to === 'composition') {
          if (this.ctx === 'workspace') this.statePlayer.set('mode', 'content')
          this.statePlayer.set('layerId', this.statePlayer.layers[0].id)
        }
        else if (to === 'content') {
          // do nothing?
        }
      }
    },
    'statePlayer.now': {
      handler (to, from) {
        // if (this.timeupdateStop) return
        // LAYER
        if (this.statePlayer.mode === 'layer') {
          if (to >= this.statePlayer.layerEnd) {
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
          if (to <= this.statePlayer.layerStart) {
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
        }
        // COMPOSITION
        else if (this.statePlayer.mode === 'composition') {
          if (to >= this.statePlayer.layerEnd) {
            // this.player.pause()
            // find next layer or go to first one
            // let layerIndex = this.statePlayer.layers.findIndex(layer => layer.id === this.statePlayer.layerId)
            // this.$log('layerIndex', layerIndex)
            // let layerIndexNext = layerIndex + 1
            // if (this.statePlayer.layers[layerIndexNext]) {
            //   // alert('layer END next')
            //   // this.statePlayer.layerId = this.layers[layerIndexNext].id
            //   this.player.statePlayer(['layerId', this.statePlayer.layers[layerIndexNext].id])
            // }
            // else {
            //   // alert('layer END, again')
            //   this.player.statePlayer(['layerId', this.statePlayer.layers[0].id])
            //   // this.statePlayer.layerId = this.layers[0].id
            //   // this.$emit('ended')
            // }
          }
          if (to < this.statePlayer.layerStart) {
            // alert('to <= this.statePlayer.layerStart')
            this.player.pause()
            this.player.setCurrentTime(this.statePlayer.layerStart)
          }
        }
        // CONTENT
        else if (this.statePlayer.mode === 'content') {
          // do nothing?
        }
      }
    }
  },
  methods: {}
}
</script>
