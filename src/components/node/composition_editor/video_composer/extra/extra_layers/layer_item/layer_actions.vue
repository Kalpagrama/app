<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '70px'
  }`).row.full-width.items-center.content-center.q-px-sm
  //- progress
  div(
    v-if="layerIsPlaying"
    :style=`{position: 'absolute', top: '0px', left: '0px', height: '4px'}`
    ).row.full-width.q-px-sm
    div(:style=`{position: 'relative', borderRadius: '2px'}`).row.fit.b-120
      div(
        :style=`{
          position: 'absolute',
          left: '0px',
          height: '4px',
          borderRadius: '2px',
          width: ((meta.now-layer.figuresAbsolute[0].t)/(layer.figuresAbsolute[1].t-layer.figuresAbsolute[0].t))*100+'%',
        }`).row.b-180
  q-btn(
    round flat @click="layerPlay()"
    :color="layerIsPlaying ? 'red' : 'white'"
    :icon="layerIsPlaying ? 'pause' : 'play_arrow'").b-110.q-mr-sm
  q-btn(round flat color="white" icon="refresh" @click="layerPlayAgain()").b-110
  .col
  q-btn(round flat color="white" icon="keyboard_arrow_up" @click="layerClose()").b-110
</template>

<script>
export default {
  name: 'layerItem-layerActions',
  props: ['player', 'meta', 'layer', 'mode', 'layerIndex'],
  data () {
    return {
    }
  },
  computed: {
    layerIsPlaying () {
      if (this.layerIndex === this.meta.layerIndexPlay && this.layerPlaying) return true
      else return false
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
          this.$emit('meta', ['mode', 'layer'])
          this.$emit('meta', ['layerIndex', this.layerIndex])
          this.$emit('meta', ['layerIndexPlay', this.layerIndex])
          this.player.setCurrentTime(this.layer.figuresAbsolute[0].t)
          this.player.update(this.layer.figuresAbsolute[0].t)
          this.player.play()
        }
      }
    },
    layerPlayAgain () {
      this.$log('layerPlayAgain')
      this.layerPlay()
    },
  }
}
</script>
