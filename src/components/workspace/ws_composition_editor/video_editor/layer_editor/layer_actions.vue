<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '50px'
  }`).row.full-width.items-start.content-start
  //- layer-progress(:layer="layer" :layerIndex="layerIndex" :stateExplorer="stateExplorer")
  div(
    :style=`{
      borderRadius: '0 0 10px 10px', overflow: 'hidden',
      paddingLeft: '60px', paddingRight: '60px',
    }`
    ).row.full-width.items-center.content-center.q-py-xs
    q-btn(round flat dense color="white" icon="flip" @click="layerSet(0)").b-70.q-mr-xs.rotate-180
    q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`)
      q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(0,0)").b-70
      q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(0,1)").b-70
    .col
    q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).q-mr-xs
      q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(1,0)").b-70
      q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(1,1)").b-70
    q-btn(round flat dense color="white" icon="flip" @click="layerSet(1)").b-70
</template>

<script>
// import layerProgress from './layer_progress'

export default {
  name: 'layerActions',
  // components: {layerProgress},
  props: ['stateExplorer', 'stateLayerEditor', 'layer'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    layerSet (index) {
      this.$log('layerSet', index)
      // check, t for layerStart and layerEnd
      let t = this.stateExplorer.currentTime
      if (index === 0) {
        if (t >= this.stateLayerEditor.layerEnd) {
          this.$q.notify({type: 'negative', message: 'Cant set t >= layer end !'})
          return
        }
      }
      else {
        if (t <= this.stateLayerEditor.layerStart) {
          this.$q.notify({type: 'negative', message: 'Cant set t <= layer start !'})
          return
        }
      }
      // set value
      this.layer.figuresAbsolute[index].t = t
      // center frames to the layer
      this.stateLayerEditor.set('need_framesLayerCenter', true)
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.stateExplorer.player.pause()
      this.stateExplorer.set('currentTime', t)
      this.stateExplorer.player.setCurrentTime(t)
    }
  }
}
</script>
