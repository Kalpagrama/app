<script>
export default {
  name: 'compositionController',
  props: ['stateExplorer'],
  data () {
    return {
    }
  },
  watch: {
    'stateExplorer.currentTime': {
      immediate: true,
      handler (to, from) {
        // this.$log('currentTime TO', to)
        // if (!this.active) return
        // if (!this.compositionPlaying) return
        // if (this.currentTimeStop) return
        // if (to > this.layerActiveEnd) {
        //   // try to find next layerActive
        //   if (this.layersStats[this.layerActive + 1]) {
        //     this.layerActiveSet(this.layerActive + 1)
        //   }
        //   else {
        //     this.layerActiveSet(0)
        //   }
        // }
        // if (to < this.layerActiveStart) {
        //   this.layerActiveSet(this.layerActive)
        // }
      }
    }
  }
}
</script>
