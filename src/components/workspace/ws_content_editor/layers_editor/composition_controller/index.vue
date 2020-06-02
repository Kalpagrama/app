<template lang="pug">
.row.full-width.q-pa-sm
  q-btn(
    @click="play()"
    flat dense color="white" no-caps
    ).q-px-md.b-60.q-mr-sm Play
  q-btn-group(flat color="white" :style=`{borderRadius: '10px'}`).b-60
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="forward(0)")
    q-btn(round flat color="white" icon="keyboard_arrow_right" @click="forward(1)")
</template>

<script>
export default {
  name: 'compositionController',
  props: ['editorType', 'player', 'meta', 'composition', 'pages', 'pageId'],
  data () {
    return {
      playStarted: false
    }
  },
  methods: {
    play () {
      this.$log('play')
      if (this.playStarted) {
        this.player.play()
      }
      else {
        this.playStarted = true
        this.player.meta(['mode', 'composition'])
        this.player.meta(['layerId', this.meta.layers[0].id])
      }
    },
    forward (isRight) {
      this.$log('forward')
      let layerIndex = this.meta.layers.findIndex(layer => layer.id === this.meta.layerId)
      if (layerIndex >= 0) {
        let layerIndexNext = isRight ? layerIndex + 1 : layerIndex - 1
        if (this.meta.layers[layerIndexNext]) {
          this.player.meta(['layerId', this.meta.layers[layerIndexNext].id])
        }
        else {
          this.player.meta(['layerId', this.meta.layers[0].id])
        }
      }
    }
  }
}
</script>
