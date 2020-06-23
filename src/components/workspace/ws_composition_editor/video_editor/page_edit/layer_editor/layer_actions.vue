<template lang="pug">
//- layer-actions
div.row.full-width
  div(
    :style=`{
    }`
    ).row.full-width.items-center.content-center.q-pa-sm
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
export default {
  name: 'layerActions',
  props: ['layer', 'storeEditor', 'storePlayer', 'storeLayerEditor'],
  data () {
    return {
    }
  },
  methods: {
    layerSet (index) {
      this.$log('layerSet', index)
      // check, t for layerStart and layerEnd
      let t = this.storePlayer.currentTime
      if (index === 0) {
        if (t >= this.storeLayerEditor.layerEnd) {
          this.$q.notify({type: 'negative', message: 'Cant set t >= layer end !'})
          return
        }
      }
      else {
        if (t <= this.storeLayerEditor.layerStart) {
          this.$q.notify({type: 'negative', message: 'Cant set t <= layer start !'})
          return
        }
      }
      // set value
      this.layer.figuresAbsolute[index].t = t
      // center frames to the layer
      this.storeLayerEditor.set('need_framesLayerCenter', true)
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.storePlayer.playPause()
      this.storePlayer.setCurrentTime(t)
    }
  }
}
</script>
