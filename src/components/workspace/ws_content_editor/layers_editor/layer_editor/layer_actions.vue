<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '90px'
  }`).row.full-width.items-start.content-start
  layer-progress(:layer="layer" :layerIndex="layerIndex" :player="player" :statePlayer="statePlayer")
  div(
    :style=`{
      borderRadius: '0 0 10px 10px', overflow: 'hidden',
      paddingLeft: '60px', paddingRight: '60px',
    }`
    ).row.full-width.items-center.content-center.q-py-xs
    q-btn(round flat dense color="white" icon="first_page" @click="layerSet(0)").b-70.q-mr-xs
    q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`)
      q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(0,0)").b-70
      q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(0,1)").b-70
    .col
    q-btn-group(flat color="white" :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).q-mr-xs
      q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="layerForward(1,0)").b-70
      q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="layerForward(1,1)").b-70
    q-btn(round flat dense color="white" icon="last_page" @click="layerSet(1)").b-70
</template>

<script>
import layerProgress from './layer_progress'

export default {
  name: 'layerItem-layerActions',
  components: {layerProgress},
  props: ['player', 'statePlayer', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    layerClose () {
      this.$log('layerClose')
      this.$emit('mode', 'norm')
      this.statePlayer.set('mode', 'content')
    },
    layerSet (index) {
      this.$log('layerSet', index)
      this.layer.figuresAbsolute[index].t = this.statePlayer.now
    },
    layerForward (index, isRight) {
      this.$log('layerForward', index, isRight)
      let t = this.layer.figuresAbsolute[index].t + (isRight ? 0.1 : -0.1)
      this.layer.figuresAbsolute[index].t = t
      this.player.pause()
      this.player.setCurrentTime(t)
      this.player.update(t)
    }
  }
}
</script>
