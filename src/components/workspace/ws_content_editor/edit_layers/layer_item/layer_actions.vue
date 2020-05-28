<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '184px'
  }`).row.full-width.items-center.content-center.q-px-sm
  //- layer progress
  .row.full-width
    q-btn(
      round @click="layerPlay()"
      :flat="!layerIsPlaying"
      :color="layerIsPlaying ? 'red' : 'white'"
      :icon="layerIsPlaying ? 'pause' : 'play_arrow'").b-110.q-mr-sm
    .col.q-px-sm
    q-btn(round flat color="white" icon="refresh" @click="layerPlayAgain()").b-110
  layer-progress(:layer="layer" :layerIndex="layerIndex" :player="player" :meta="meta")
  div(:style=`{height: '50px'}`).row.full-width.items-center.content-center
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layerForward(0,0)").b-110.q-mr-sm
    q-btn(round flat color="white" icon="keyboard_arrow_right" @click="layerForward(0,1)").b-110.q-mr-sm
    .col
    q-btn(round flat color="white" icon="keyboard_arrow_left" @click="layerForward(1,0)").b-110.q-mr-sm
    q-btn(round flat color="white" icon="keyboard_arrow_right" @click="layerForward(1,1)").b-110
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
    q-btn(round flat color="white" icon="more_vert").b-110
    .col
    q-btn(round color="green" icon="check" @click="layerClose()").b-110
</template>

<script>
import layerProgress from './layer_progress'

export default {
  name: 'layerItem-layerActions',
  components: {layerProgress},
  props: ['player', 'meta', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
    }
  },
  computed: {
    layerIsPlaying () {
      return this.meta.playing
    },
    layerStart () {
      return this.layer.figuresAbsolute[0].t
    },
    layerEnd () {
      return this.layer.figuresAbsolute[1].t
    }
  },
  methods: {
    layerClose () {
      this.$log('layerClose')
      // this.$tween.to(this, 0.5, {height: this.heightNormal})
      // this.$emit('meta', ['mode', 'watch'])
      // this.$emit('meta', ['layerIndexPlay', -1])
      this.$emit('mode', 'norm')
    },
    layerPlay () {
      this.$log('layerPlay')
      if (this.meta.playing) {
        // this.layerPlaying = false
        this.player.pause()
      }
      else {
        if (this.layerPlaying) {
          this.player.play()
        }
        else {
          this.layerPlaying = true
          this.player.pause()
          // this.$emit('meta', ['mode', 'layer'])
          // this.$emit('meta', ['layerIndex', this.layerIndex])
          // this.$emit('meta', ['layerIndexPlay', this.layerIndex])
          this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
          this.player.update(this.layer.figuresAbsolute[0].t)
          this.player.play()
        }
      }
    },
    layerPlayAgain () {
      this.$log('layerPlayAgain')
      this.player.setCurrentTime(this.layerStart)
      this.player.update(this.layerStart)
      this.player.play()
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
