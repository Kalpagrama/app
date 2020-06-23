<script>
export default {
  name: 'compositionController',
  props: ['composition', 'storePlayer', 'compositionPlaying'],
  data () {
    return {
    }
  },
  watch: {
    'storePlayer.currentTime': {
      immediate: true,
      handler (to, from) {
        if (!this.compositionPlaying) return
        this.$log('storePlayer.currentTime TO', to)
        if (to > this.layerActiveEnd) {
          // try to find next layerActive
          if (this.layersStats[this.layerActive + 1]) {
            this.layerActiveSet(this.layerActive + 1)
          }
          else {
            this.layerActiveSet(0)
          }
        }
        if (to < this.layerActiveStart) {
          this.layerActiveSet(this.layerActive)
        }
      }
    }
  }
}
</script>
